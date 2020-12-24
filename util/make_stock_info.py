from PIL import Image, ImageFont, ImageDraw
import sys

image = Image.new("RGB", (658, 658), (255,255,255)) # 흰 정사각형 배경 이미지 생성
draw = ImageDraw.Draw(image)
im = Image.open(f"./pictures/stock/{sys.argv[1]}.png") # argv[1]은 사진 이름
image.paste(im, (0, 125)) # 이미지가 658 * 408이므로 125를 더해서 y축 위치를 가운데로 조정 후 붙여넣기

msg = sys.argv[2] # argv[2]는 주식 이름
font = ImageFont.truetype("./fonts/CookieRun Regular.ttf", 32)
draw.text((20, 13), msg, (0, 0, 0), font)

if sys.argv[4] != "하락" : # argv[4]는 상승, 하락 여부
    msg = f"▲{sys.argv[5]} | {sys.argv[6]}%" # argv[5]는 변화량, argv[6]는 변화율
    font = ImageFont.truetype("./fonts/CookieRun Regular.ttf", 30)
    draw.text((20, 75), msg, (255, 100, 100), font)
else :
    msg = f"▼{sys.argv[5]} | {sys.argv[6]}%"
    font = ImageFont.truetype("./fonts/CookieRun Regular.ttf", 30)
    draw.text((20, 75), msg, (100, 100, 255), font)

msg = f"{sys.argv[3]}원" # argv[3]은 현재 시가
font = ImageFont.truetype("./fonts/CookieRun Regular.ttf", 28)
draw.text((470, 15), msg, (200, 100, 100), font)

msg = f"({sys.argv[7]}원 ~ {sys.argv[8]}원)" # argv[7]은 저가, argv[8]은 고가
font = ImageFont.truetype("./fonts/CookieRun Regular.ttf", 25)
draw.text((270, 77), msg, (0, 0, 0), font)

msg = f"52주 최고가: {sys.argv[9]}원" # argv[9]은 52주 최고가
font = ImageFont.truetype("./fonts/CookieRun Regular.ttf", 30)
draw.text((20, 545), msg, (50, 50, 50), font)

msg = f"52주 최저가: {sys.argv[10]}원" # argv[10]은 52주 최저가
font = ImageFont.truetype("./fonts/CookieRun Regular.ttf", 30)
draw.text((20, 585), msg, (50, 50, 50), font)

image.save(f"./pictures/stock/{sys.argv[1]}.png") # 병합한 이미지 저장하기