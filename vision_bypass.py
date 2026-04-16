import sys
import cv2
from ultralytics import YOLO

# 1. Load the brand new YOLO26 model
# This downloads the 'brain' automatically on the first run
try:
    model = YOLO('yolo26n.pt') 
except Exception as e:
    print(f"Error loading model: {e}")

def solve_security(image_path):
    try:
        # 2. Run the AI with 'augment' to beat image-distortion security
        # We use a lower confidence (0.25) to make sure it finds something
        results = model.predict(source=image_path, save=False, conf=0.25, augment=True)
        
        found_objects = []
        for result in results:
            for box in result.boxes:
                name = model.names[int(box.cls[0])]
                found_objects.append(name)
        
        if found_objects:
            # Join all found objects into one string for the Discord DM
            print(f"IDENTIFIED: {', '.join(found_objects)}")
        else:
            print("No objects identified in the security wall.")

    except Exception as e:
        print(f"AI Processing Error: {e}")

if __name__ == "__main__":
    # This part handles the command from your bot.js
    if len(sys.argv) > 1:
        target_image = sys.argv[1]
    else:
        # Fallback if you just run the script manually
        target_image = 'test.jpg' 
    
    solve_security(target_image)