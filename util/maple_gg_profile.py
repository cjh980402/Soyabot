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
w, h = drawer.textsize(msg, font)
drawer.text((200 - w // 2, 347 - h // 2), msg, (255, 255, 255), font)

server_img = Image.open(requests.get(sys.argv[6], stream = True).raw).convert("RGBA").resize((17, 17))
image.paste(server_img, (180 - w // 2, 350 - h // 2), mask = server_img)

w1, h1 = drawer.textsize("인기도 ", ImageFont.truetype("./fonts/CookieRun Bold.ttf", 16))
w2, h2 = drawer.textsize(sys.argv[7], ImageFont.truetype("./fonts/CookieRun Regular.ttf", 16))
w3, h3 = drawer.textsize("  길드 ", ImageFont.truetype("./fonts/CookieRun Bold.ttf", 16))
w4, h4 = drawer.textsize(sys.argv[8], ImageFont.truetype("./fonts/CookieRun Regular.ttf", 16))

font = ImageFont.truetype("./fonts/CookieRun Regular.ttf", 16)
drawer.text((190 + (w1 - w2 - w3 - w4) // 2, 375 - h2 // 2), sys.argv[7], (201, 170, 127), font) # 인기도 숫자
drawer.text((190 + (w1 + w2 + w3 - w4) // 2, 375 - h4 // 2), sys.argv[8], (201, 170, 127), font) # 길드명

font = ImageFont.truetype("./fonts/CookieRun Bold.ttf", 16)
drawer.text((190 - (w1 + w2 + w3 + w4) // 2, 375 - h1 // 2), "인기도 ", (255, 227, 189), font)
drawer.text((190 + (w1 + w2 - w3 - w4) // 2 , 375 - h3 // 2), "  길드 ", (255, 227, 189), font)

if sys.argv[9] != " ": # 직업랭킹
    w1, h1 = drawer.textsize("직업랭킹 ", ImageFont.truetype("./fonts/CookieRun Bold.ttf", 16))
    w2, h2 = drawer.textsize(sys.argv[9], ImageFont.truetype("./fonts/CookieRun Regular.ttf", 16))

    font = ImageFont.truetype("./fonts/CookieRun Regular.ttf", 16)
    drawer.text((190 + (w1 - w2) // 2, 405 - h1 // 2), sys.argv[9], (201, 170, 127), font)

    font = ImageFont.truetype("./fonts/CookieRun Bold.ttf", 16)
    drawer.text((190 - (w1 + w2) // 2, 405 - h2 // 2), "직업랭킹 ", (255, 227, 189), font)

deco_img = Image.open(requests.get("https://kr-cdn.maple.gg/images/images/card-effect@3x.png", stream = True).raw).resize((102, 16))
image.paste(deco_img, (190 - deco_img.size[0] // 2, 423), mask = deco_img)

msg = "무릉도장             유니온              더시드  "
font = ImageFont.truetype("./fonts/CookieRun Bold.ttf", 17)
w, h = drawer.textsize(msg, font)
drawer.text((190 - w // 2, 453 - h // 2), msg, (255, 227, 189), font)

msg = sys.argv[10] if sys.argv[10] == "기록없음" else f"최고 {sys.argv[10]}" # 무릉 기록, 삼항연산자
font = ImageFont.truetype("./fonts/CookieRun Regular.ttf", 16)
w, h = drawer.textsize(msg, font)
drawer.text((73 - w // 2, 478 - h // 2), msg, (201, 170, 127), font)

msg = sys.argv[11] # 무릉 클리어 시간
font = ImageFont.truetype("./fonts/CookieRun Regular.ttf", 13)
w, h = drawer.textsize(msg, font)
drawer.text((73 - w // 2, 498 - h // 2), msg, (201, 170, 127), font)

msg = sys.argv[12] # 유니온 등급
font = ImageFont.truetype("./fonts/CookieRun Regular.ttf", 16)
w, h = drawer.textsize(msg, font)
drawer.text((190 - w // 2, 478 - h // 2), msg, (201, 170, 127), font)

msg = sys.argv[13] # 유니온 레벨
font = ImageFont.truetype("./fonts/CookieRun Regular.ttf", 13)
w, h = drawer.textsize(msg, font)
drawer.text((190 - w // 2, 498 - h // 2), msg, (201, 170, 127), font)

msg = sys.argv[14] if sys.argv[14] == "기록없음" else f"최고 {sys.argv[14]}" # 시드 기록
font = ImageFont.truetype("./fonts/CookieRun Regular.ttf", 16)
w, h = drawer.textsize(msg, font)
drawer.text((303 - w // 2, 478 - h // 2), msg, (201, 170, 127), font)

msg = sys.argv[15] # 시드 클리어 시간
font = ImageFont.truetype("./fonts/CookieRun Regular.ttf", 13)
w, h = drawer.textsize(msg, font)
drawer.text((303 - w // 2, 498 - h // 2), msg, (201, 170, 127), font)

image.save("./pictures/profile.png")