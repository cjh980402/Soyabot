from PIL import Image
import requests
import sys
import numpy as np
import tflite_runtime.interpreter as tflite
# import time

img = Image.open(requests.get(sys.argv[1], stream = True).raw)
w, h = img.size
image = Image.new('RGB', (512, 512), "WHITE") # RGM 스케일의 흰 정사각형 배경 이미지 생성
if w >= h: # 리사이징 후 붙여넣기
    image.paste(img.resize((512, 512 * h // w)), (0, 256 * (w - h) // w))
else:
    image.paste(img.resize((512 * w // h, 512)), (256 * (h - w) // h, 0))
img = np.asarray(image, dtype = np.float32)
img = np.expand_dims(img, 0) # 512×512×3 -> 1×512×512×3
img = (img - 128) / 64 # [0, 255] -> [-2, 2]
# print(np.min(img), np.max(img), img.shape) # Check [-2, 2], Shape

# Load the TFLite model and allocate tensors.
interpreter = tflite.Interpreter(model_path = './util/model_float32.tflite')
interpreter.allocate_tensors()

# Get input and output tensors.
input_details = interpreter.get_input_details()
output_details = interpreter.get_output_details()

# Test the model on random input data.
input_shape = input_details[0]['shape']
interpreter.set_tensor(input_details[0]['index'], img)

# t1 = time.time()
interpreter.invoke()
# t2 = time.time()
# print(t2 - t1)

# The function `get_tensor()` returns a copy of the tensor data.
# Use `tensor()` in order to get a pointer to the tensor.
output_data = interpreter.get_tensor(output_details[0]['index'])
# print(np.min(output_data), np.max(output_data))

out = 255 - np.squeeze(output_data) * 255
if w >= h: # 그레이 스케일로 변환 후 원래 비율로 크롭
    Image.fromarray(out).convert('L').crop((0, 256 * (w - h) // w, 512, 256 * (w + h) // w)).save('./pictures/portrait.png')
else:
    Image.fromarray(out).convert('L').crop((256 * (h - w) // h, 0, 256 * (w + h) // h, 512)).save('./pictures/portrait.png')