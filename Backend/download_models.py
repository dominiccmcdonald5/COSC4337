#!/usr/bin/env python3
"""
Google Drive Training Data Download Script

This script downloads all training data from a shared Google Drive folder
for the biodiversity analysis project.
"""

import os
import gdown
import zipfile
from pathlib import Path
import json
import requests
import re

# Configuration
DOWNLOAD_DIR = "downloaded_training_data"
TRAIN_DATA_DIR = "train_full"

# Your Google Drive shared folder URL
GOOGLE_DRIVE_FOLDER_URL = "https://drive.google.com/drive/folders/1AIlHzCxf8aSS9pUw7IWB2U7gJjlG07Jm"

def ensure_directories():
    """Create necessary directories if they don't exist"""
    directories = [DOWNLOAD_DIR, TRAIN_DATA_DIR]
    for directory in directories:
        Path(directory).mkdir(parents=True, exist_ok=True)
        print(f"✓ Directory ready: {directory}")

def extract_folder_id(url):
    """Extract folder ID from Google Drive URL"""
    match = re.search(r'/folders/([a-zA-Z0-9-_]+)', url)
    if match:
        return match.group(1)
    else:
        raise ValueError(f"Could not extract folder ID from URL: {url}")

def download_folder_as_zip(folder_url, output_path):
    """Download entire Google Drive folder as ZIP"""
    try:
        print(f"📥 Downloading entire folder as ZIP...")
        print(f"   From: {folder_url}")
        print(f"   To: {output_path}")
        
        folder_id = extract_folder_id(folder_url)
        
        # Use gdown to download the entire folder
        gdown.download_folder(
            url=folder_url,
            output=TRAIN_DATA_DIR,
            quiet=False,
            use_cookies=False
        )
        
        print(f"✅ Downloaded folder contents to: {TRAIN_DATA_DIR}")
        return True
        
    except Exception as e:
        print(f"❌ Error downloading folder: {e}")
        print("Trying alternative method...")
        
        try:
            # Alternative: Download as ZIP file
            folder_id = extract_folder_id(folder_url)
            zip_url = f"https://drive.google.com/uc?id={folder_id}&export=download"
            
            print(f"📦 Downloading as ZIP file...")
            gdown.download(zip_url, output_path, quiet=False)
            
            # Extract the ZIP
            extract_zip_file(output_path, TRAIN_DATA_DIR)
            return True
            
        except Exception as e2:
            print(f"❌ Alternative method also failed: {e2}")
            return False

def extract_zip_file(zip_path, extract_to):
    """Extract zip file to specified directory"""
    try:
        print(f"📦 Extracting {zip_path}...")
        with zipfile.ZipFile(zip_path, 'r') as zip_ref:
            zip_ref.extractall(extract_to)
        print(f"✅ Extracted to: {extract_to}")
        
        # Clean up ZIP file
        os.remove(zip_path)
        print(f"🗑️  Cleaned up ZIP file")
        return True
    except Exception as e:
        print(f"❌ Error extracting {zip_path}: {e}")
        return False

def count_downloaded_files():
    """Count the number of FLAC files downloaded"""
    flac_count = 0
    if os.path.exists(TRAIN_DATA_DIR):
        for root, dirs, files in os.walk(TRAIN_DATA_DIR):
            flac_count += len([f for f in files if f.lower().endswith('.flac')])
    return flac_count

def download_training_data():
    """Download all training data from Google Drive folder"""
    ensure_directories()
    
    zip_output_path = os.path.join(DOWNLOAD_DIR, "training_data.zip")
    
    print("🎵 Downloading training audio files from Google Drive")
    print(f"Folder URL: {GOOGLE_DRIVE_FOLDER_URL}")
    
    success = download_folder_as_zip(GOOGLE_DRIVE_FOLDER_URL, zip_output_path)
    
    if success:
        # Count downloaded files
        file_count = count_downloaded_files()
        print(f"\n📊 Download Summary:")
        print(f"   FLAC files downloaded: {file_count}")
        print(f"   Download location: {TRAIN_DATA_DIR}")
        
        if file_count > 0:
            print(f"✅ Successfully downloaded {file_count} training files!")
            
            # Update the training script to use the new directory
            print(f"\n📝 Note: Update your training script to use:")
            print(f"   TRAIN_DIR = '{TRAIN_DATA_DIR}'")
            
        else:
            print("⚠️  No FLAC files found. Please check the folder contents.")
    else:
        print("\n❌ Download failed. Please try manually:")
        print("1. Go to the Google Drive folder")
        print("2. Select all files (Ctrl+A)")
        print("3. Right-click and 'Download'")
        print(f"4. Extract to {TRAIN_DATA_DIR}")

def main():
    """Main function"""
    print("🚀 Starting Google Drive Training Data Download")
    print("=" * 60)
    
    # Check if gdown is installed
    try:
        import gdown
    except ImportError:
        print("❌ gdown not installed. Installing...")
        os.system("pip install gdown")
        import gdown
    
    download_training_data()
    
    print(f"\n✅ Download process completed!")
    print(f"Training data location: {os.path.abspath(TRAIN_DATA_DIR)}")

if __name__ == "__main__":
    main()