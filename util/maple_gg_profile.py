from PIL import Image, ImageFont, ImageDraw
import requests
import sys

image = Image.open(requests.get("https://maple.gg/images/images/bg-character-card@3x.png", stream = True).raw).resize((380, 550))

char_img = Image.open(requests.get(sys.argv[1], stream = True).raw).resize((200, 200)) # url -> Image
image.paste(char_img, (90, 65), mask = char_img) # 투명 배경때문에 mask를 붙여넣을 이미지로 지정

drawer = ImageDraw.Draw(image)

msg = sys.argv[2] # 이름
font = ImageFont.truetype("./fonts/CookieRun Bold.ttf", 30)
w, h = drawer.textsize(msg, font) # 텍스트의 사이즈를 반환
drawer.text((190 - w // 2, 308 - h // 2), msg, (255, 255, 255), font)

msg = f"{sys.argv[3]}  |  Lv.{sys.argv[4]}  |  {sys.argv[5]}" # 서버, 레벨, 직업
font = ImageFont.truetype("./fonts/CookieRun Regular.ttf", 17)
w, h = drawer.textsize(msg, font) # 텍스트의 사이즈를 반환
drawer.text((200 - w // 2, 347 - h // 2), msg, (255, 255, 255), font)

server_img = Image.open(requests.get(sys.argv[6], stream = True).raw).convert("RGBA").resize((17, 17))
image.paste(server_img, (180 - w // 2, 350 - h // 2), mask = server_img)

msg = f"인기도 {sys.argv[7]}  길드 {sys.argv[8]}"
font = ImageFont.truetype("./fonts/CookieRun Regular.ttf", 16)
w, h = drawer.textsize(msg, font) # 텍스트의 사이즈를 반환
drawer.text((190 - w // 2, 375 - h // 2), msg, (201, 170, 127), font)

drawer.text((190 - w // 2, 375 - h // 2), "인기도", (255, 227, 189), ImageFont.truetype("./fonts/CookieRun Bold.ttf", 16))
drawer.text((190 - w // 2 + drawer.textsize(f"인기도 {sys.argv[7]}  ", font)[0], 375 - h // 2), "길드", (255, 227, 189), ImageFont.truetype("./fonts/CookieRun Bold.ttf", 16))

if sys.argv[9] != " ": # 직업랭킹
    msg = f"직업랭킹 {sys.argv[9]}"
    font = ImageFont.truetype("./fonts/CookieRun Regular.ttf", 16)
    w, h = drawer.textsize(msg, font) # 텍스트의 사이즈를 반환
    drawer.text((190 - w // 2, 405 - h // 2), msg, (201, 170, 127), font)

    msg = "직업랭킹"
    font = ImageFont.truetype("./fonts/CookieRun Bold.ttf", 16)
    drawer.text((190 - w // 2, 405 - h // 2), msg, (255, 227, 189), font)

deco_img = Image.open(requests.get("https://kr-cdn.maple.gg/images/images/card-effect@3x.png", stream = True).raw).resize((102, 16))
image.paste(deco_img, (190 - deco_img.size[0] // 2, 423), mask = deco_img)

msg = "무릉도장             유니온              더시드  "
font = ImageFont.truetype("./fonts/CookieRun Bold.ttf", 17)
w, h = drawer.textsize(msg, font) # 텍스트의 사이즈를 반환
drawer.text((190 - w // 2, 453 - h // 2), msg, (255, 227, 189), font)

msg = sys.argv[10] if sys.argv[10] == "기록없음" else f"최고 {sys.argv[10]}" # 무릉 기록
font = ImageFont.truetype("./fonts/CookieRun Regular.ttf", 16)
w, h = drawer.textsize(msg, font) # 텍스트의 사이즈를 반환
drawer.text((73 - w // 2, 478 - h // 2), msg, (201, 170, 127), font)

msg = sys.argv[11] # 무릉 클리어 시간
font = ImageFont.truetype("./fonts/CookieRun Regular.ttf", 13)
w, h = drawer.textsize(msg, font) # 텍스트의 사이즈를 반환
drawer.text((73 - w // 2, 498 - h // 2), msg, (201, 170, 127), font)

msg = sys.argv[12] # 유니온 등급
font = ImageFont.truetype("./fonts/CookieRun Regular.ttf", 16)
w, h = drawer.textsize(msg, font) # 텍스트의 사이즈를 반환
drawer.text((190 - w // 2, 478 - h // 2), msg, (201, 170, 127), font)

msg = sys.argv[13] # 유니온 레벨
font = ImageFont.truetype("./fonts/CookieRun Regular.ttf", 13)
w, h = drawer.textsize(msg, font) # 텍스트의 사이즈를 반환
drawer.text((190 - w // 2, 498 - h // 2), msg, (201, 170, 127), font)

msg = sys.argv[14] if sys.argv[14] == "기록없음" else f"최고 {sys.argv[14]}" # 시드 기록
font = ImageFont.truetype("./fonts/CookieRun Regular.ttf", 16)
w, h = drawer.textsize(msg, font) # 텍스트의 사이즈를 반환
drawer.text((303 - w // 2, 478 - h // 2), msg, (201, 170, 127), font)

msg = sys.argv[15] # 시드 클리어 시간
font = ImageFont.truetype("./fonts/CookieRun Regular.ttf", 13)
w, h = drawer.textsize(msg, font) # 텍스트의 사이즈를 반환
drawer.text((303 - w // 2, 498 - h // 2), msg, (201, 170, 127), font)

image.save("./pictures/profile.png")