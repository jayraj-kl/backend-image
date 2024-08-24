import sys
# import os
from scripts.preprocessing import preprocess_data
from scripts.prediction import get_prediction

def predict(image_path):
    preprocessed_img = preprocess_data("./" + image_path)
    prediction = get_prediction(preprocessed_img)
    print(prediction)

if __name__ == "__main__":
    sys.stdout.reconfigure(encoding='utf-8')
    sys.stderr.reconfigure(encoding='utf-8')
    if len(sys.argv) != 2:
        print("Usage: python app.py <image_path>")
        sys.exit(1)
    
    image_path = sys.argv[1]
    predict(image_path)
