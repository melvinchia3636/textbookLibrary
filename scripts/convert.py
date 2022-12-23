#!/usr/bin/python3
"""For merging images into a PDF file."""

import os
from PIL import Image
from PyPDF2 import PdfMerger

PATH = "dist/sm3"

for book in list(sorted(os.listdir(PATH), key=lambda x: x.lower())):
    if book != ".DS_Store":
        for chapter in sorted(os.listdir(os.path.join(PATH, book)), key=lambda x: os.path.getmtime(os.path.join(PATH, book, x))):
            if not os.path.exists(os.path.join("result/", PATH, book)):
                os.makedirs(os.path.join("result/", PATH, book))
            if chapter != ".DS_Store":
                print(book + '/' + chapter)
                try:
                    images = [Image.open(os.path.join(
                        PATH, book, chapter, file
                    )).convert("RGB") for file in sorted(os.listdir(os.path.join(PATH, book, chapter))) if file != ".DS_Store"]
                    images[0].save(f'./result/{PATH}/{book}/{chapter}.pdf', save_all=True, append_images=images[1:])
                except OSError:
                    print("Error: " + book + '/' + chapter)

        merger = PdfMerger()

        for pdf in sorted(os.listdir(f'./result/{PATH}/{book}'), key=lambda x: os.path.getmtime(os.path.join("./result/", PATH, book, x))):
            if pdf != "final.pdf":
                merger.append(f'./result/{PATH}/{book}/{pdf}')

        merger.write(f'./result/{PATH}/{book}.pdf')

        for pdf in os.listdir(os.path.join("result/", PATH)):
            if os.path.isdir(os.path.join("result/", PATH, pdf)):
                for file in os.listdir(os.path.join("result/", PATH, pdf)):
                    os.remove(os.path.join("result/", PATH, pdf, file))
                os.rmdir(os.path.join("result/", PATH, pdf))
