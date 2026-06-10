import os
import shutil
import uuid
from abc import ABC, abstractmethod
from fastapi import UploadFile
from app.config import settings

class StorageService(ABC):
    @abstractmethod
    async def upload_file(self, file: UploadFile, folder: str = "") -> str:
        """
        Uploads a file to the storage system and returns the accessible URL.
        """
        pass

    @abstractmethod
    async def delete_file(self, file_path: str) -> bool:
        """
        Deletes a file from the storage system.
        """
        pass

    @abstractmethod
    def generate_presigned_download_url(self, file_path: str) -> str:
        """
        Generates a URL to download/view the file.
        """
        pass


class LocalStorageService(StorageService):
    def __init__(self, upload_dir: str = settings.UPLOAD_DIR):
        self.upload_dir = upload_dir
        # Ensure the upload directory exists
        os.makedirs(self.upload_dir, exist_ok=True)

    async def upload_file(self, file: UploadFile, folder: str = "") -> str:
        # Generate unique file name to prevent collision
        file_ext = os.path.splitext(file.filename)[1]
        unique_filename = f"{uuid.uuid4()}{file_ext}"
        
        target_dir = os.path.join(self.upload_dir, folder) if folder else self.upload_dir
        os.makedirs(target_dir, exist_ok=True)
        
        file_path = os.path.join(target_dir, unique_filename)
        
        # Save file asynchronously by chunks
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        # Return local static file access path
        relative_path = f"uploads/{folder}/{unique_filename}" if folder else f"uploads/{unique_filename}"
        # Standardize path slashes for URL format
        relative_url = relative_path.replace("\\", "/")
        return f"/api/{relative_url}"

    async def delete_file(self, file_path: str) -> bool:
        # Standardize file path mapping
        # File URL is in format "/api/uploads/..." or "uploads/..."
        clean_path = file_path.replace("/api/", "")
        disk_path = os.path.join(self.upload_dir, "..", clean_path)
        
        if os.path.exists(disk_path):
            os.remove(disk_path)
            return True
        return False

    def generate_presigned_download_url(self, file_path: str) -> str:
        # For local files, the static URL itself is the direct download URL
        return file_path


class S3StorageService(StorageService):
    def __init__(self):
        # Dynamically import boto3 to avoid hard requirement for local runs
        try:
            import boto3
            from botocore.config import Config
        except ImportError:
            raise RuntimeError("boto3 is required for S3StorageService. Please install boto3.")

        self.s3_client = boto3.client(
            "s3",
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
            region_name=settings.AWS_REGION,
            config=Config(signature_version="s3v4")
        )
        self.bucket = settings.AWS_BUCKET_NAME

    async def upload_file(self, file: UploadFile, folder: str = "") -> str:
        import boto3
        
        file_ext = os.path.splitext(file.filename)[1]
        unique_filename = f"{uuid.uuid4()}{file_ext}"
        s3_key = f"{folder}/{unique_filename}" if folder else unique_filename
        
        # Upload using boto3
        # Since boto3 is sync, we run it in a separate thread/executor to avoid blocking the event loop
        # Note: For production use, aioboto3 is preferred, but standard boto3 in threadpool is very robust
        import anyio
        
        async def _upload():
            self.s3_client.upload_fileobj(
                file.file,
                self.bucket,
                s3_key,
                ExtraArgs={"ContentType": file.content_type}
            )
            
        await anyio.to_thread.run_sync(_upload)
        
        # Return clean URL or presigned URL depending on ACL
        return f"https://{self.bucket}.s3.{settings.AWS_REGION}.amazonaws.com/{s3_key}"

    async def delete_file(self, file_path: str) -> bool:
        # Extract s3 key from URL
        import anyio
        
        prefix = f"https://{self.bucket}.s3.{settings.AWS_REGION}.amazonaws.com/"
        s3_key = file_path.replace(prefix, "")
        
        async def _delete():
            self.s3_client.delete_object(Bucket=self.bucket, Key=s3_key)
            
        try:
            await anyio.to_thread.run_sync(_delete)
            return True
        except Exception:
            return False

    def generate_presigned_download_url(self, file_path: str) -> str:
        prefix = f"https://{self.bucket}.s3.{settings.AWS_REGION}.amazonaws.com/"
        s3_key = file_path.replace(prefix, "")
        
        # Generate URL valid for 1 hour
        url = self.s3_client.generate_presigned_url(
            "get_object",
            Params={"Bucket": self.bucket, "Key": s3_key},
            ExpiresIn=3600
        )
        return url


# Factory dependency to load appropriate storage service
def get_storage_service() -> StorageService:
    if settings.STORAGE_TYPE == "s3":
        return S3StorageService()
    return LocalStorageService()
