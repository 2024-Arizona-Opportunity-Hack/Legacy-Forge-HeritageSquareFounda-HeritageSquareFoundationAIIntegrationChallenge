from PIL import Image
from transformers import DetrImageProcessor, DetrForObjectDetection
import requests
from io import BytesIO
import torch

# Initialize the DETR model for object detection
detection_processor = DetrImageProcessor.from_pretrained("facebook/detr-resnet-50")
detection_model = DetrForObjectDetection.from_pretrained("facebook/detr-resnet-50")

def download_image_and_title_from_google_drive(drive_url):
    # Modify the Google Drive URL to get the direct download link
    file_id = drive_url.split("/d/")[1].split("/")[0]
    download_url = f"https://drive.google.com/uc?export=download&id={file_id}"
    
    # Download the image using the direct download link
    response = requests.get(download_url)
    
    # Extract file title from headers (content-disposition)
    file_title = "Untitled"  # Default if no title is available
    if 'content-disposition' in response.headers:
        content_disposition = response.headers['content-disposition']
        if 'filename=' in content_disposition:
            file_title = content_disposition.split("filename=")[1].strip('"')
    
    # Check if the response content is valid
    if response.status_code == 200 and 'image' in response.headers.get('content-type', ''):
        img = Image.open(BytesIO(response.content))
        return img, file_title
    else:
        raise ValueError("Failed to download a valid image from the provided URL")

def detect_and_classify_image(image):
    # Preprocess the image for object detection
    inputs = detection_processor(images=image, return_tensors="pt")

    # Perform object detection using DETR
    outputs = detection_model(**inputs)
    
    # Extract the bounding boxes and labels
    target_sizes = torch.tensor([image.size[::-1]])  # DETR expects (height, width)
    results = detection_processor.post_process_object_detection(outputs, target_sizes=target_sizes)[0]

    detected_objects = []
    
    # Iterate through detections and extract bounding boxes, labels, and scores
    for score, label, box in zip(results["scores"], results["labels"], results["boxes"]):
        # Only consider objects with confidence score > 0.5
        if score > 0.5:
            box = [round(i, 2) for i in box.tolist()]  # Convert box to list of rounded coordinates
            detected_objects.append({
                "label": detection_model.config.id2label[label.item()],  # Convert label id to label name
                "score": round(score.item(), 3),  # Confidence score
                "box": box  # Bounding box
            })
    
    return detected_objects

# Example usage
google_drive_url = "https://drive.google.com/file/d/1E1bZssv3tepvf_VfGae5n-LtyTEdLefG/view"  # Replace with your Google Drive URL
image, file_title = download_image_and_title_from_google_drive(google_drive_url)

# Detect and classify objects in the image
detected_objects = detect_and_classify_image(image)

# Print the results
print(f"File Title: {file_title}")
print(f"Detected Objects: {detected_objects}")
