"""Extract unchanged catalogue pixels with hand-traced alpha mattes. No label redraws."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter
import json
import argparse
import pymupdf

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'frontend/public/images'
OUT.mkdir(parents=True, exist_ok=True)
parser=argparse.ArgumentParser()
parser.add_argument('--pdf',type=Path,required=True,help='Path to the supplied Fruzodrinks.pdf')
args=parser.parse_args()
(ROOT/'source').mkdir(exist_ok=True)
document=pymupdf.open(args.pdf)
for i,page in enumerate(document):
    (ROOT/f'source/original-{i+1}.png').write_bytes(document.extract_image(page.get_images()[0][0])['image'])


def cut(image, points, name, max_height=1000):
    mask = Image.new('L', image.size)
    ImageDraw.Draw(mask).polygon(points, fill=255)
    mask = mask.filter(ImageFilter.GaussianBlur(.65))
    result = image.convert('RGBA')
    result.putalpha(mask)
    result = result.crop(mask.getbbox())
    result.thumbnail((1000, max_height), Image.Resampling.LANCZOS)
    result.save(OUT / f'{name}.webp', quality=92, method=6)
    return result.size

# All coordinates address the native 1024x1536 catalogue image.
left_top = [(263,426),(264,372),(276,359),(313,355),(360,355),(401,362),(409,374),(410,427),(398,434),(399,473),(415,494),(442,530),(460,564),(469,599)]
right_top = [(x+350,y) for x,y in left_top]
left_back = [(200,600),(207,568),(223,536),(253,495),(271,474),(272,441),(263,436)]
right_back = [(x+350,y) for x,y in left_back]
bottoms = {
 'lemon-salt': [(469,899),(460,997),(471,1060),(474,1090),(409,1098),(394,1118),(320,1125),(265,1125),(196,1115),(131,1111),(57,1093),(20,1073),(26,1000),(23,953),(30,917),(51,887),(84,873),(94,814),(142,798),(190,828),(200,845)],
 'lemon': [(819,850),(871,816),(914,800),(914,841),(941,865),(970,912),(988,947),(985,1001),(995,1060),(967,1100),(931,1110),(908,1118),(844,1121),(784,1111),(716,1116),(648,1107),(592,1111),(581,1083),(590,1038),(606,1000),(602,958),(566,967),(572,932),(597,912),(550,888)],
 'cola': [(469,949),(489,1006),(499,1061),(475,1085),(481,1112),(418,1117),(375,1124),(319,1122),(267,1118),(220,1122),(168,1109),(116,1116),(99,1104),(49,1107),(44,1071),(68,1040),(78,992),(87,959),(130,962),(182,975),(200,951)],
 'dew': [(819,920),(873,890),(918,884),(952,898),(972,928),(980,962),(971,1014),(987,1068),(982,1090),(922,1111),(861,1112),(822,1093),(782,1119),(734,1110),(681,1104),(636,1114),(606,1099),(582,1086),(566,1105),(547,1096),(568,1066),(584,1058),(583,1021),(604,1010),(550,1011)],
 'apple': [(469,977),(479,1020),(488,1051),(453,1057),(424,1088),(402,1095),(378,1113),(329,1120),(277,1115),(234,1106),(188,1106),(124,1106),(77,1094),(20,1088),(7,1070),(43,1045),(48,1005),(31,960),(29,928),(41,899),(69,886),(98,879),(137,880),(63,853),(74,839),(137,818),(181,823),(200,843)],
 'pineapple': [(819,895),(854,849),(855,799),(879,827),(902,765),(910,820),(946,756),(935,815),(1002,773),(976,836),(1020,809),(983,866),(1020,855),(1000,894),(994,918),(985,942),(991,995),(976,1063),(947,1095),(895,1117),(839,1118),(800,1122),(737,1113),(676,1118),(615,1104),(558,1102),(568,1068),(596,1042),(583,1012),(606,996),(550,999)],
 'mixed-fruits': [(469,982),(505,954),(494,1000),(534,1033),(533,1090),(503,1116),(434,1127),(376,1122),(321,1127),(269,1125),(241,1118),(184,1119),(139,1108),(115,1098),(59,1103),(5,1100),(29,1061),(42,1045),(28,1006),(17,965),(17,922),(29,891),(52,874),(98,869),(110,861),(80,794),(130,803),(171,821),(200,846)],
 'mango': [(819,841),(853,827),(886,828),(924,848),(945,873),(965,916),(966,938),(982,962),(992,1000),(994,1043),(979,1081),(951,1101),(972,1110),(978,1130),(925,1120),(895,1123),(833,1127),(774,1129),(709,1124),(657,1119),(607,1104),(557,1100),(578,1065),(606,1043),(560,1032),(581,1010),(610,991),(550,982)],
 'green-apple': [(469,986),(482,1026),(488,1050),(447,1070),(401,1092),(369,1116),(309,1123),(257,1111),(219,1103),(177,1104),(137,1101),(99,1106),(51,1101),(10,1086),(32,1056),(48,1031),(31,995),(21,955),(27,918),(44,894),(79,881),(106,880),(104,851),(76,815),(79,793),(121,802),(163,824),(200,846)],
 'nannari': [(819,907),(873,874),(914,839),(960,815),(951,863),(991,846),(1003,870),(968,909),(978,945),(984,970),(971,998),(984,1020),(973,1056),(1000,1078),(992,1101),(943,1110),(901,1118),(841,1117),(794,1123),(731,1118),(687,1115),(638,1115),(615,1096),(566,1104),(580,1070),(613,1036),(550,1020)],
}
pairs=[(2,'lemon-salt','lemon'),(3,'cola','dew'),(4,'apple','pineapple'),(5,'mixed-fruits','mango'),(6,'green-apple','nannari')]
manifest=[]
for page,left,right in pairs:
    im=Image.open(ROOT/f'source/original-{page}.png')
    for slug,top,back in [(left,left_top,left_back),(right,right_top,right_back)]:
        size=cut(im, top+bottoms[slug]+back, slug)
        manifest.append({'slug':slug,'page':page,'dimensions':size,'source':'Unchanged catalogue pixels; alpha matte extraction; base partly occluded by catalogue fruit.'})
    pix=document[page-1].get_pixmap(matrix=pymupdf.Matrix(683/576,683/576))
    Image.frombytes('RGB',(pix.width,pix.height),pix.samples).save(OUT/f'catalogue-{page}.webp',quality=85)

im=Image.open(ROOT/'source/original-5.png')
cut(im, [(606,1043),(630,1009),(676,994),(699,976),(745,977),(768,996),(793,1004),(811,1028),(835,1034),(857,1063),(870,1096),(863,1120),(827,1127),(777,1129),(720,1126),(672,1120),(634,1109),(614,1090)],'mango-piece',400)
cut(im, [(819,844),(855,829),(888,831),(919,847),(944,874),(959,906),(965,936),(940,927),(907,912),(871,896),(838,871)],'leaf',260)
logo=Image.open(ROOT/'source/original-5.png').crop((258,35,765,335)).convert('RGBA')
logo_mask=Image.new('L',logo.size)
logo_mask.putdata([255 if (s>100 and not 110<h<160) or v<85 else 0 for h,s,v in logo.convert('HSV').get_flattened_data()])
logo_mask=logo_mask.filter(ImageFilter.MaxFilter(5)).filter(ImageFilter.GaussianBlur(.5))
logo.putalpha(logo_mask)
logo.save(OUT/'logo.webp',quality=95)
# A source-backed editorial crop, excluding the catalogue's contact/footer text.
story=Image.open(ROOT/'source/original-7.png').crop((0,1050,1024,1350))
story.save(OUT/'fruit-story.webp',quality=90)
(ROOT/'source/asset-manifest.json').write_text(json.dumps(manifest,indent=2))
print(json.dumps(manifest,indent=2))

import runpy
runpy.run_path(str(ROOT/'scripts/extract_flavor_details.py'))
