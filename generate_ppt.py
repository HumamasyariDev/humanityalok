"""
SmartPark PPT Presentation Generator v2
Non-technical, user-friendly presentation with screenshot placeholders.
"""

from pptx import Presentation
from pptx.util import Inches, Pt, Emu
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE
from pptx.oxml.ns import qn

# -- Color palette --
BLUE_DARK   = RGBColor(0x1E, 0x3A, 0x5F)
BLUE_MED    = RGBColor(0x2B, 0x6C, 0xB3)
BLUE_LIGHT  = RGBColor(0x3B, 0x82, 0xF6)
BLUE_BG     = RGBColor(0xDB, 0xEA, 0xFE)
WHITE       = RGBColor(0xFF, 0xFF, 0xFF)
BLACK       = RGBColor(0x00, 0x00, 0x00)
GRAY_DARK   = RGBColor(0x33, 0x33, 0x33)
GRAY_MED    = RGBColor(0x66, 0x66, 0x66)
GRAY_LIGHT  = RGBColor(0xF1, 0xF5, 0xF9)
GRAY_BG     = RGBColor(0xF8, 0xFA, 0xFC)
GREEN       = RGBColor(0x10, 0xB9, 0x81)
ORANGE      = RGBColor(0xF5, 0x9E, 0x0B)
RED         = RGBColor(0xEF, 0x44, 0x44)
PURPLE      = RGBColor(0x8B, 0x5C, 0xF6)

prs = Presentation()
prs.slide_width  = Inches(13.333)
prs.slide_height = Inches(7.5)

SW = prs.slide_width
SH = prs.slide_height


# -- Helpers --

def add_bg(slide, color):
    bg = slide.background
    fill = bg.fill
    fill.solid()
    fill.fore_color.rgb = color

def add_gradient_rect(slide, left, top, width, height, color1, color2):
    shape = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, left, top, width, height)
    shape.line.fill.background()
    fill = shape.fill
    fill.gradient()
    fill.gradient_stops[0].color.rgb = color1
    fill.gradient_stops[0].position = 0.0
    fill.gradient_stops[1].color.rgb = color2
    fill.gradient_stops[1].position = 1.0
    return shape

def add_rect(slide, left, top, w, h, fill_color=None, border_color=None, radius=None):
    shape = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE if radius else MSO_SHAPE.RECTANGLE, left, top, w, h)
    if fill_color:
        shape.fill.solid()
        shape.fill.fore_color.rgb = fill_color
    else:
        shape.fill.background()
    if border_color:
        shape.line.color.rgb = border_color
        shape.line.width = Pt(1)
    else:
        shape.line.fill.background()
    return shape

def set_text(shape, text, size=14, color=GRAY_DARK, bold=False, align=PP_ALIGN.LEFT, font_name="Segoe UI"):
    tf = shape.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = text
    p.font.size = Pt(size)
    p.font.color.rgb = color
    p.font.bold = bold
    p.font.name = font_name
    p.alignment = align
    return tf

def add_text_box(slide, left, top, w, h, text, size=14, color=GRAY_DARK, bold=False, align=PP_ALIGN.LEFT, font_name="Segoe UI"):
    txBox = slide.shapes.add_textbox(left, top, w, h)
    tf = txBox.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = text
    p.font.size = Pt(size)
    p.font.color.rgb = color
    p.font.bold = bold
    p.font.name = font_name
    p.alignment = align
    return txBox

def add_multiline(slide, left, top, w, h, lines, size=13, color=GRAY_DARK, font_name="Segoe UI"):
    """lines = list of str or (text, bold, color_override)"""
    txBox = slide.shapes.add_textbox(left, top, w, h)
    tf = txBox.text_frame
    tf.word_wrap = True
    for i, item in enumerate(lines):
        if isinstance(item, str):
            txt, bld, clr = item, False, color
        else:
            txt = item[0]
            bld = item[1] if len(item) > 1 else False
            clr = item[2] if len(item) > 2 else color
        if i == 0:
            p = tf.paragraphs[0]
        else:
            p = tf.add_paragraph()
        p.text = txt
        p.font.size = Pt(size)
        p.font.color.rgb = clr
        p.font.bold = bld
        p.font.name = font_name
        p.space_after = Pt(4)
    return txBox

def add_card(slide, left, top, w, h, title, body_lines, accent_color=BLUE_MED, title_size=14, body_size=11):
    card = add_rect(slide, left, top, w, h, fill_color=WHITE, border_color=RGBColor(0xE2,0xE8,0xF0))
    # Accent top bar
    bar = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, left, top, w, Pt(4))
    bar.fill.solid()
    bar.fill.fore_color.rgb = accent_color
    bar.line.fill.background()
    # Title
    add_text_box(slide, left + Inches(0.2), top + Inches(0.12), w - Inches(0.4), Inches(0.35),
                 title, size=title_size, color=BLUE_DARK, bold=True)
    # Body
    add_multiline(slide, left + Inches(0.2), top + Inches(0.5), w - Inches(0.4), h - Inches(0.6),
                  body_lines, size=body_size, color=GRAY_MED)

def add_icon_card(slide, left, top, w, h, icon_text, title, desc, accent_color=BLUE_MED):
    """Card with a big icon/emoji, title, and description"""
    card = add_rect(slide, left, top, w, h, fill_color=WHITE, border_color=RGBColor(0xE2,0xE8,0xF0), radius=True)
    # Accent left bar
    bar = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, left, top + Inches(0.15), Pt(5), h - Inches(0.3))
    bar.fill.solid()
    bar.fill.fore_color.rgb = accent_color
    bar.line.fill.background()
    # Icon circle
    circle_size = Inches(0.7)
    circle = slide.shapes.add_shape(MSO_SHAPE.OVAL, left + Inches(0.25), top + Inches(0.2), circle_size, circle_size)
    circle.fill.solid()
    circle.fill.fore_color.rgb = accent_color
    circle.line.fill.background()
    set_text(circle, icon_text, size=20, color=WHITE, bold=True, align=PP_ALIGN.CENTER)
    # Title
    add_text_box(slide, left + Inches(1.1), top + Inches(0.15), w - Inches(1.3), Inches(0.35),
                 title, size=14, color=BLUE_DARK, bold=True)
    # Description
    add_text_box(slide, left + Inches(1.1), top + Inches(0.5), w - Inches(1.3), h - Inches(0.6),
                 desc, size=11, color=GRAY_MED)

def add_placeholder_screenshot(slide, left, top, w, h, label):
    """Gray box with dashed border and label as screenshot placeholder"""
    shape = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, left, top, w, h)
    shape.fill.solid()
    shape.fill.fore_color.rgb = RGBColor(0xF0, 0xF0, 0xF0)
    shape.line.color.rgb = RGBColor(0xBB, 0xBB, 0xBB)
    shape.line.width = Pt(1.5)
    shape.line.dash_style = 2  # dash
    # Label in center
    tf = shape.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = "[ Screenshot ]"
    p.font.size = Pt(14)
    p.font.color.rgb = RGBColor(0x99, 0x99, 0x99)
    p.font.bold = True
    p.font.name = "Segoe UI"
    p.alignment = PP_ALIGN.CENTER
    p2 = tf.add_paragraph()
    p2.text = label
    p2.font.size = Pt(11)
    p2.font.color.rgb = RGBColor(0xAA, 0xAA, 0xAA)
    p2.font.name = "Segoe UI"
    p2.alignment = PP_ALIGN.CENTER
    tf.paragraphs[0].space_before = Pt(h.inches * 20)  # rough vertical center
    return shape


# -- Flowchart helpers --

def fc_oval(slide, cx, cy, w, h, text, fill=WHITE, stroke=BLUE_DARK):
    left = cx - w // 2
    top = cy - h // 2
    shape = slide.shapes.add_shape(MSO_SHAPE.OVAL, left, top, w, h)
    shape.fill.solid()
    shape.fill.fore_color.rgb = fill
    shape.line.color.rgb = stroke
    shape.line.width = Pt(1.5)
    tf = shape.text_frame
    tf.word_wrap = True
    tf.paragraphs[0].alignment = PP_ALIGN.CENTER
    p = tf.paragraphs[0]
    p.text = text
    p.font.size = Pt(10)
    p.font.color.rgb = BLUE_DARK
    p.font.bold = True
    p.font.name = "Segoe UI"
    return shape

def fc_box(slide, cx, cy, w, h, text, fill=WHITE, stroke=BLUE_MED, font_size=9):
    left = cx - w // 2
    top = cy - h // 2
    shape = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, w, h)
    shape.fill.solid()
    shape.fill.fore_color.rgb = fill
    shape.line.color.rgb = stroke
    shape.line.width = Pt(1)
    tf = shape.text_frame
    tf.word_wrap = True
    tf.paragraphs[0].alignment = PP_ALIGN.CENTER
    p = tf.paragraphs[0]
    p.text = text
    p.font.size = Pt(font_size)
    p.font.color.rgb = GRAY_DARK
    p.font.name = "Segoe UI"
    return shape

def fc_arrow(slide, x1, y1, x2, y2, color=BLUE_MED):
    connector = slide.shapes.add_connector(1, x1, y1, x2, y2)
    connector.line.color.rgb = color
    connector.line.width = Pt(1.2)
    cxnSp = connector._element
    spPr_parent = cxnSp.find(qn('p:spPr'))
    if spPr_parent is not None:
        ln_el = spPr_parent.find(qn('a:ln'))
        if ln_el is not None:
            tail = ln_el.makeelement(qn('a:tailEnd'), {'type': 'triangle', 'w': 'med', 'len': 'med'})
            ln_el.append(tail)
    return connector

def fc_arrow_down(slide, cx, y_from, y_to, color=BLUE_MED):
    return fc_arrow(slide, cx, y_from, cx, y_to, color)


# ==================================================
# SLIDE 1: COVER
# ==================================================
sl = prs.slides.add_slide(prs.slide_layouts[6])
add_gradient_rect(sl, 0, 0, SW, SH, BLUE_DARK, RGBColor(0x0F, 0x25, 0x40))

deco1 = sl.shapes.add_shape(MSO_SHAPE.OVAL, Inches(9.5), Inches(-1.5), Inches(5), Inches(5))
deco1.fill.solid()
deco1.fill.fore_color.rgb = RGBColor(0x2B, 0x4F, 0x7F)
deco1.line.fill.background()

deco2 = sl.shapes.add_shape(MSO_SHAPE.OVAL, Inches(-1.5), Inches(4.5), Inches(4), Inches(4))
deco2.fill.solid()
deco2.fill.fore_color.rgb = RGBColor(0x1A, 0x30, 0x50)
deco2.line.fill.background()

add_text_box(sl, Inches(1.5), Inches(1.5), Inches(10), Inches(0.6),
             "SMARTPARK", size=18, color=BLUE_LIGHT, bold=True)
add_text_box(sl, Inches(1.5), Inches(2.0), Inches(10), Inches(1.2),
             "Sistem Manajemen Parkir\nCerdas & Modern", size=42, color=WHITE, bold=True)

line = sl.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(1.5), Inches(3.5), Inches(2.5), Pt(3))
line.fill.solid()
line.fill.fore_color.rgb = BLUE_LIGHT
line.line.fill.background()

add_text_box(sl, Inches(1.5), Inches(3.9), Inches(8), Inches(0.8),
             "Solusi digital untuk mengelola parkir dengan mudah, cepat,\ndan dilengkapi asisten AI yang siap membantu kapan saja.",
             size=16, color=RGBColor(0xA0, 0xC4, 0xF0))

add_text_box(sl, Inches(1.5), Inches(5.8), Inches(8), Inches(0.5),
             "HumamasyariDev  -  2026",
             size=14, color=RGBColor(0x70, 0x90, 0xB0))


# ==================================================
# SLIDE 2: LATAR BELAKANG / MASALAH
# ==================================================
sl = prs.slides.add_slide(prs.slide_layouts[6])
add_bg(sl, GRAY_BG)
add_rect(sl, 0, 0, SW, Inches(0.9), fill_color=BLUE_DARK)
add_text_box(sl, Inches(0.8), Inches(0.15), Inches(10), Inches(0.6),
             "01  |  Mengapa SmartPark?", size=24, color=WHITE, bold=True)

# Left: Masalah
add_rect(sl, Inches(0.6), Inches(1.3), Inches(5.8), Inches(5.5), fill_color=WHITE, border_color=RGBColor(0xE2,0xE8,0xF0))
bar_m = sl.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0.6), Inches(1.3), Inches(5.8), Inches(0.5))
bar_m.fill.solid()
bar_m.fill.fore_color.rgb = RED
bar_m.line.fill.background()
add_text_box(sl, Inches(0.8), Inches(1.32), Inches(5.4), Inches(0.45),
             "Masalah Parkir Manual", size=16, color=WHITE, bold=True)

masalah = [
    ("Pencatatan manual rawan kesalahan", False, GRAY_DARK),
    "Struk hilang, data kendaraan tidak akurat, sulit dilacak",
    "",
    ("Perhitungan biaya tidak konsisten", False, GRAY_DARK),
    "Petugas hitung manual, tarif bisa berbeda-beda",
    "",
    ("Sulit memantau pendapatan", False, GRAY_DARK),
    "Owner harus rekap manual dari buku catatan",
    "",
    ("Antrian lama saat jam sibuk", False, GRAY_DARK),
    "Proses masuk-keluar lambat tanpa sistem otomatis",
    "",
    ("Tidak ada data historis yang rapi", False, GRAY_DARK),
    "Analisa bisnis sulit dilakukan tanpa rekap digital",
]
add_multiline(sl, Inches(0.9), Inches(2.0), Inches(5.2), Inches(4.5), masalah, size=12, color=GRAY_MED)

# Right: Solusi
add_rect(sl, Inches(6.9), Inches(1.3), Inches(5.8), Inches(5.5), fill_color=WHITE, border_color=RGBColor(0xE2,0xE8,0xF0))
bar_s = sl.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(6.9), Inches(1.3), Inches(5.8), Inches(0.5))
bar_s.fill.solid()
bar_s.fill.fore_color.rgb = GREEN
bar_s.line.fill.background()
add_text_box(sl, Inches(7.1), Inches(1.32), Inches(5.4), Inches(0.45),
             "Solusi SmartPark", size=16, color=WHITE, bold=True)

solusi = [
    ("Semua tercatat otomatis", False, GRAY_DARK),
    "Setiap kendaraan masuk langsung tercatat di sistem",
    "",
    ("Tarif dihitung otomatis", False, GRAY_DARK),
    "Sistem hitung biaya berdasarkan durasi, tanpa salah",
    "",
    ("Rekap pendapatan real-time", False, GRAY_DARK),
    "Owner bisa pantau grafik dan tabel kapan saja",
    "",
    ("Proses cepat dengan barcode", False, GRAY_DARK),
    "Scan barcode untuk keluar, tidak perlu cari manual",
    "",
    ("AI Chatbot siap bantu", False, GRAY_DARK),
    "Tanya biaya parkir, status kendaraan, cukup chat saja",
]
add_multiline(sl, Inches(7.2), Inches(2.0), Inches(5.2), Inches(4.5), solusi, size=12, color=GRAY_MED)

# Arrow in the middle
arrow_shape = sl.shapes.add_shape(MSO_SHAPE.RIGHT_ARROW, Inches(6.15), Inches(3.5), Inches(0.6), Inches(0.5))
arrow_shape.fill.solid()
arrow_shape.fill.fore_color.rgb = BLUE_MED
arrow_shape.line.fill.background()


# ==================================================
# SLIDE 3: APA ITU SMARTPARK + FITUR UTAMA
# ==================================================
sl = prs.slides.add_slide(prs.slide_layouts[6])
add_bg(sl, GRAY_BG)
add_rect(sl, 0, 0, SW, Inches(0.9), fill_color=BLUE_DARK)
add_text_box(sl, Inches(0.8), Inches(0.15), Inches(10), Inches(0.6),
             "02  |  Apa itu SmartPark?", size=24, color=WHITE, bold=True)

# Description box
add_rect(sl, Inches(0.6), Inches(1.3), Inches(12.1), Inches(1.8), fill_color=WHITE, border_color=RGBColor(0xE2,0xE8,0xF0))
add_multiline(sl, Inches(1.0), Inches(1.5), Inches(11.5), Inches(1.5), [
    ("SmartPark adalah aplikasi web pengelolaan parkir yang dirancang untuk mempermudah", False, GRAY_DARK),
    ("pekerjaan petugas parkir, administrator, dan pemilik usaha parkir.", False, GRAY_DARK),
    ("", False),
    ("Dengan SmartPark, semua proses parkir dari kendaraan masuk hingga keluar tercatat", False, GRAY_DARK),
    ("secara otomatis, dilengkapi dengan sistem barcode dan asisten AI yang pintar.", False, GRAY_DARK),
], size=14, color=GRAY_DARK)

# 6 feature cards in 2 rows of 3
features = [
    ("P", "Pencatatan Otomatis", "Setiap kendaraan masuk langsung\ntercatat lengkap dengan waktu\ndan kode parkir unik.", BLUE_MED),
    ("B", "Sistem Barcode", "Kode parkir PKR-XXXXXX dicetak\nsebagai barcode. Scan saat\nkeluar, cepat dan akurat.", GREEN),
    ("T", "Hitung Tarif Otomatis", "Biaya parkir dihitung otomatis\nberdasarkan durasi per jam.\nTidak ada lagi salah hitung.", ORANGE),
    ("R", "Rekap & Laporan", "Grafik pendapatan, tabel transaksi,\ndan ringkasan per jenis kendaraan.\nBisa export ke CSV.", PURPLE),
    ("A", "AI Chatbot Pintar", "Tanya biaya parkir, cek status\nkendaraan, atau foto struk.\nAI langsung jawab!", RED),
    ("H", "Multi Pengguna", "3 level akses: Admin kelola semua,\nPetugas operasional harian,\nOwner pantau pendapatan.", BLUE_DARK),
]

card_w = Inches(3.8)
card_h = Inches(1.5)
gap_x = Inches(0.25)
gap_y = Inches(0.2)
start_x = Inches(0.6)
start_y = Inches(3.5)

for i, (icon, title, desc, accent) in enumerate(features):
    row = i // 3
    col = i % 3
    x = start_x + col * (card_w + gap_x)
    y = start_y + row * (card_h + gap_y)
    add_icon_card(sl, x, y, card_w, card_h, icon, title, desc, accent)


# ==================================================
# SLIDE 4: KEUNGGULAN SMARTPARK (Manual vs Digital)
# ==================================================
sl = prs.slides.add_slide(prs.slide_layouts[6])
add_bg(sl, GRAY_BG)
add_rect(sl, 0, 0, SW, Inches(0.9), fill_color=BLUE_DARK)
add_text_box(sl, Inches(0.8), Inches(0.15), Inches(10), Inches(0.6),
             "03  |  Kenapa Pilih SmartPark?", size=24, color=WHITE, bold=True)

# Comparison table
col1_x = Inches(0.6)
col2_x = Inches(4.3)
col3_x = Inches(8.0)
col_w_tbl = Inches(3.5)
row_h = Inches(0.55)

# Headers
for cx, label, clr in [(col1_x, "Aspek", BLUE_DARK), (col2_x, "Parkir Manual", RED), (col3_x, "SmartPark", GREEN)]:
    hdr = add_rect(sl, cx, Inches(1.3), col_w_tbl, Inches(0.5), fill_color=clr)
    set_text(hdr, label, size=15, color=WHITE, bold=True, align=PP_ALIGN.CENTER)

rows = [
    ("Pencatatan", "Tulis tangan di buku", "Otomatis tercatat di sistem"),
    ("Perhitungan Biaya", "Hitung manual, rawan salah", "Otomatis per jam, selalu akurat"),
    ("Proses Keluar", "Cari data manual, lama", "Scan barcode, hitungan detik"),
    ("Laporan Pendapatan", "Rekap manual akhir bulan", "Grafik & tabel real-time"),
    ("Cek Status Kendaraan", "Buka buku catatan", "Tanya AI Chatbot langsung"),
    ("Keamanan Data", "Buku bisa hilang/rusak", "Tersimpan aman di database"),
    ("Multi Lokasi", "Sulit dikelola", "Satu sistem untuk semua area"),
]

for i, (aspek, manual, smart) in enumerate(rows):
    y = Inches(1.85) + i * (row_h + Inches(0.05))
    bg_clr = WHITE if i % 2 == 0 else GRAY_LIGHT
    
    c1 = add_rect(sl, col1_x, y, col_w_tbl, row_h, fill_color=bg_clr, border_color=RGBColor(0xE8,0xE8,0xE8))
    set_text(c1, aspek, size=12, color=BLUE_DARK, bold=True, align=PP_ALIGN.CENTER)
    
    c2 = add_rect(sl, col2_x, y, col_w_tbl, row_h, fill_color=bg_clr, border_color=RGBColor(0xE8,0xE8,0xE8))
    set_text(c2, manual, size=11, color=GRAY_MED, align=PP_ALIGN.CENTER)
    
    c3 = add_rect(sl, col3_x, y, col_w_tbl, row_h, fill_color=bg_clr, border_color=RGBColor(0xE8,0xE8,0xE8))
    set_text(c3, smart, size=11, color=GREEN, bold=True, align=PP_ALIGN.CENTER)

# Expand table to edge
for cx in [col1_x, col2_x, col3_x]:
    bot_line = sl.shapes.add_shape(MSO_SHAPE.RECTANGLE, cx, Inches(6.1), col_w_tbl, Pt(2))
    bot_line.fill.solid()
    bot_line.fill.fore_color.rgb = RGBColor(0xE8,0xE8,0xE8)
    bot_line.line.fill.background()

# Bottom tagline
add_text_box(sl, Inches(0.6), Inches(6.4), Inches(12), Inches(0.5),
             "SmartPark mengubah proses parkir manual yang lambat menjadi cepat, akurat, dan modern.",
             size=14, color=BLUE_MED, bold=True, align=PP_ALIGN.CENTER)


# ==================================================
# SLIDE 5: SIAPA YANG MENGGUNAKAN (3 Roles)
# ==================================================
sl = prs.slides.add_slide(prs.slide_layouts[6])
add_bg(sl, GRAY_BG)
add_rect(sl, 0, 0, SW, Inches(0.9), fill_color=BLUE_DARK)
add_text_box(sl, Inches(0.8), Inches(0.15), Inches(10), Inches(0.6),
             "04  |  Siapa yang Menggunakan?", size=24, color=WHITE, bold=True)

# 3 role cards
roles = [
    ("Admin", BLUE_MED, "A", [
        "Mengelola seluruh sistem",
        "Mengatur pengguna (tambah/ubah/hapus)",
        "Mengatur tarif parkir per jenis kendaraan",
        "Mengatur area dan kapasitas parkir",
        "Melihat semua transaksi & rekap",
        "Memantau log aktivitas pengguna",
        "Menggunakan AI Chatbot",
    ]),
    ("Petugas", GREEN, "P", [
        "Menjalankan operasional harian",
        "Mencatat kendaraan masuk",
        "Mencetak kartu parkir (barcode)",
        "Memproses kendaraan keluar & pembayaran",
        "Mencetak struk pembayaran",
        "Menggunakan AI Chatbot",
    ]),
    ("Owner", ORANGE, "O", [
        "Memantau kinerja bisnis parkir",
        "Melihat dashboard ringkasan",
        "Melihat grafik pendapatan harian",
        "Melihat rekap transaksi per periode",
        "Export data ke CSV",
        "Menggunakan AI Chatbot",
    ]),
]

role_w = Inches(3.8)
role_h = Inches(5.2)
role_gap = Inches(0.35)
role_start_x = Inches(0.6)

for i, (role_name, color, icon, items) in enumerate(roles):
    x = role_start_x + i * (role_w + role_gap)
    y = Inches(1.3)
    
    # Card
    add_rect(sl, x, y, role_w, role_h, fill_color=WHITE, border_color=RGBColor(0xE2,0xE8,0xF0))
    
    # Header bar
    bar = sl.shapes.add_shape(MSO_SHAPE.RECTANGLE, x, y, role_w, Inches(0.9))
    bar.fill.solid()
    bar.fill.fore_color.rgb = color
    bar.line.fill.background()
    
    # Icon circle on header
    circle = sl.shapes.add_shape(MSO_SHAPE.OVAL, x + Inches(0.2), y + Inches(0.12), Inches(0.65), Inches(0.65))
    circle.fill.solid()
    circle.fill.fore_color.rgb = WHITE
    circle.line.fill.background()
    set_text(circle, icon, size=22, color=color, bold=True, align=PP_ALIGN.CENTER)
    
    add_text_box(sl, x + Inches(1.0), y + Inches(0.22), role_w - Inches(1.2), Inches(0.5),
                 role_name, size=20, color=WHITE, bold=True)
    
    # Items
    lines = []
    for item in items:
        lines.append(("   " + item, False, GRAY_DARK))
    add_multiline(sl, x + Inches(0.2), y + Inches(1.1), role_w - Inches(0.4), role_h - Inches(1.3),
                  lines, size=12, color=GRAY_DARK)


# ==================================================
# SLIDE 6: ALUR KERJA PARKIR (Flow Sederhana)
# ==================================================
sl = prs.slides.add_slide(prs.slide_layouts[6])
add_bg(sl, GRAY_BG)
add_rect(sl, 0, 0, SW, Inches(0.9), fill_color=BLUE_DARK)
add_text_box(sl, Inches(0.8), Inches(0.15), Inches(10), Inches(0.6),
             "05  |  Bagaimana SmartPark Bekerja?", size=24, color=WHITE, bold=True)

# Background area
add_rect(sl, Inches(0.5), Inches(1.1), Inches(12.3), Inches(5.9), fill_color=WHITE, border_color=RGBColor(0xE2,0xE8,0xF0))

# -- MASUK (left) --
add_text_box(sl, Inches(0.8), Inches(1.2), Inches(5), Inches(0.35),
             "Kendaraan Masuk", size=15, color=BLUE_MED, bold=True)

cx_l = Inches(3.2)
bw = Inches(2.2)
bh = Inches(0.55)
ow = Inches(1.5)
oh = Inches(0.5)

steps_masuk = [
    ("oval", "Kendaraan Datang"),
    ("box", "Petugas Input\nPlat Nomor & Jenis"),
    ("box", "Sistem Cek Area Parkir\n(Masih tersedia?)"),
    ("box", "Transaksi Tercatat Otomatis\nWaktu Masuk Disimpan"),
    ("box", "Kartu Parkir Dicetak\n(Barcode PKR-XXXXXX)"),
    ("oval", "Kendaraan Masuk"),
]

y_pos = Inches(1.85)
y_step = Inches(0.85)

for i, (stype, text) in enumerate(steps_masuk):
    y = y_pos + i * y_step
    if stype == "oval":
        fc_oval(sl, cx_l, y, ow, oh, text, fill=BLUE_BG, stroke=BLUE_MED)
        if i < len(steps_masuk) - 1:
            fc_arrow_down(sl, cx_l, y + oh//2, y + oh//2 + Inches(0.32), BLUE_MED)
    else:
        fc_box(sl, cx_l, y, bw, bh, text, fill=GRAY_LIGHT, stroke=BLUE_MED, font_size=10)
        if i < len(steps_masuk) - 1:
            fc_arrow_down(sl, cx_l, y + bh//2, y + bh//2 + Inches(0.28), BLUE_MED)

# Divider
div = sl.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(6.3), Inches(1.3), Pt(2), Inches(5.5))
div.fill.solid()
div.fill.fore_color.rgb = RGBColor(0xE2, 0xE8, 0xF0)
div.line.fill.background()

# -- KELUAR (right) --
add_text_box(sl, Inches(7.0), Inches(1.2), Inches(5), Inches(0.35),
             "Kendaraan Keluar", size=15, color=GREEN, bold=True)

cx_r = Inches(9.5)

steps_keluar = [
    ("oval", "Kendaraan Mau Keluar"),
    ("box", "Petugas Scan Barcode\natau Input Kode Parkir"),
    ("box", "Sistem Hitung Biaya\nOtomatis (Durasi x Tarif)"),
    ("box", "Pembayaran Diproses\nTransaksi Selesai"),
    ("box", "Struk Pembayaran Dicetak\n(Detail Lengkap + Barcode)"),
    ("oval", "Kendaraan Keluar"),
]

for i, (stype, text) in enumerate(steps_keluar):
    y = y_pos + i * y_step
    if stype == "oval":
        fc_oval(sl, cx_r, y, ow, oh, text, fill=BLUE_BG, stroke=GREEN)
        if i < len(steps_keluar) - 1:
            fc_arrow_down(sl, cx_r, y + oh//2, y + oh//2 + Inches(0.32), GREEN)
    else:
        fc_box(sl, cx_r, y, bw, bh, text, fill=GRAY_LIGHT, stroke=GREEN, font_size=10)
        if i < len(steps_keluar) - 1:
            fc_arrow_down(sl, cx_r, y + bh//2, y + bh//2 + Inches(0.28), GREEN)


# ==================================================
# SLIDE 7: FITUR AI CHATBOT (Non-teknis)
# ==================================================
sl = prs.slides.add_slide(prs.slide_layouts[6])
add_bg(sl, GRAY_BG)
add_rect(sl, 0, 0, SW, Inches(0.9), fill_color=BLUE_DARK)
add_text_box(sl, Inches(0.8), Inches(0.15), Inches(10), Inches(0.6),
             "06  |  Fitur Unggulan: AI Chatbot", size=24, color=WHITE, bold=True)

# Description
add_rect(sl, Inches(0.6), Inches(1.3), Inches(12.1), Inches(1.3), fill_color=WHITE, border_color=RGBColor(0xE2,0xE8,0xF0))
add_multiline(sl, Inches(1.0), Inches(1.45), Inches(11.5), Inches(1.0), [
    ("SmartPark dilengkapi AI Chatbot yang bisa menjawab pertanyaan seputar parkir secara instan.", False, GRAY_DARK),
    ("Cukup ketik pertanyaan, foto struk parkir, atau arahkan kamera -- AI akan langsung membantu.", False, GRAY_DARK),
], size=14, color=GRAY_DARK)

# 3 cara pakai chatbot
chat_cards = [
    ("Chat Teks", BLUE_MED, [
        "Ketik pertanyaan langsung:",
        "",
        '"Berapa biaya parkir B 1234 AB?"',
        '"Status kendaraan D 5678 EF?"',
        '"Berapa total pendapatan hari ini?"',
        "",
        "AI akan jawab berdasarkan data",
        "parkir yang ada di sistem.",
    ]),
    ("Foto / Upload Gambar", GREEN, [
        "Upload foto struk parkir atau",
        "kartu parkir:",
        "",
        "AI akan baca teks dari gambar",
        "lalu cari data kendaraan terkait",
        "dan berikan info lengkap.",
        "",
        "Cocok jika struk sulit dibaca.",
    ]),
    ("Kamera Langsung", ORANGE, [
        "Arahkan kamera ke struk parkir",
        "atau kartu parkir:",
        "",
        "Ambil foto langsung dari browser,",
        "AI akan proses dan berikan",
        "informasi biaya & status.",
        "",
        "Praktis tanpa perlu upload file!",
    ]),
]

chat_w = Inches(3.8)
chat_h = Inches(3.8)
chat_gap = Inches(0.35)
chat_start = Inches(0.6)

for i, (title, color, items) in enumerate(chat_cards):
    x = chat_start + i * (chat_w + chat_gap)
    y = Inches(3.0)
    
    add_rect(sl, x, y, chat_w, chat_h, fill_color=WHITE, border_color=RGBColor(0xE2,0xE8,0xF0))
    
    # Header
    hdr = sl.shapes.add_shape(MSO_SHAPE.RECTANGLE, x, y, chat_w, Inches(0.55))
    hdr.fill.solid()
    hdr.fill.fore_color.rgb = color
    hdr.line.fill.background()
    add_text_box(sl, x + Inches(0.2), y + Inches(0.08), chat_w - Inches(0.4), Inches(0.4),
                 title, size=16, color=WHITE, bold=True, align=PP_ALIGN.CENTER)
    
    # Items
    lines = [(item, False, GRAY_DARK) for item in items]
    add_multiline(sl, x + Inches(0.2), y + Inches(0.7), chat_w - Inches(0.4), chat_h - Inches(0.8),
                  lines, size=11, color=GRAY_DARK)


# ==================================================
# SLIDE 8: TAMPILAN APLIKASI 1 (Screenshot Placeholders)
# ==================================================
sl = prs.slides.add_slide(prs.slide_layouts[6])
add_bg(sl, GRAY_BG)
add_rect(sl, 0, 0, SW, Inches(0.9), fill_color=BLUE_DARK)
add_text_box(sl, Inches(0.8), Inches(0.15), Inches(10), Inches(0.6),
             "07  |  Tampilan Aplikasi", size=24, color=WHITE, bold=True)

add_text_box(sl, Inches(0.6), Inches(1.05), Inches(12), Inches(0.3),
             "Ganti kotak abu-abu di bawah dengan screenshot asli dari aplikasi SmartPark.",
             size=11, color=GRAY_MED)

# 2 rows x 3 cols placeholders
screenshots_1 = [
    "Halaman Login",
    "Dashboard Admin",
    "Transaksi Masuk",
    "Transaksi Keluar",
    "Daftar Transaksi",
    "Cetak Struk Parkir",
]

ss_w = Inches(3.8)
ss_h = Inches(2.5)
ss_gap_x = Inches(0.25)
ss_gap_y = Inches(0.25)
ss_start_x = Inches(0.6)
ss_start_y = Inches(1.5)

for i, label in enumerate(screenshots_1):
    row = i // 3
    col = i % 3
    x = ss_start_x + col * (ss_w + ss_gap_x)
    y = ss_start_y + row * (ss_h + ss_gap_y)
    add_placeholder_screenshot(sl, x, y, ss_w, ss_h, label)
    # Label below
    add_text_box(sl, x, y + ss_h + Inches(0.02), ss_w, Inches(0.25),
                 label, size=11, color=BLUE_DARK, bold=True, align=PP_ALIGN.CENTER)


# ==================================================
# SLIDE 9: TAMPILAN APLIKASI 2 (More Screenshots)
# ==================================================
sl = prs.slides.add_slide(prs.slide_layouts[6])
add_bg(sl, GRAY_BG)
add_rect(sl, 0, 0, SW, Inches(0.9), fill_color=BLUE_DARK)
add_text_box(sl, Inches(0.8), Inches(0.15), Inches(10), Inches(0.6),
             "08  |  Tampilan Aplikasi (Lanjutan)", size=24, color=WHITE, bold=True)

add_text_box(sl, Inches(0.6), Inches(1.05), Inches(12), Inches(0.3),
             "Ganti kotak abu-abu di bawah dengan screenshot asli dari aplikasi SmartPark.",
             size=11, color=GRAY_MED)

screenshots_2 = [
    "Rekap & Grafik Pendapatan",
    "Kelola Pengguna",
    "AI Chatbot (Chat Teks)",
    "AI Chatbot (Scan Kamera)",
    "Kelola Area Parkir",
    "Log Aktivitas",
]

for i, label in enumerate(screenshots_2):
    row = i // 3
    col = i % 3
    x = ss_start_x + col * (ss_w + ss_gap_x)
    y = ss_start_y + row * (ss_h + ss_gap_y)
    add_placeholder_screenshot(sl, x, y, ss_w, ss_h, label)
    add_text_box(sl, x, y + ss_h + Inches(0.02), ss_w, Inches(0.25),
                 label, size=11, color=BLUE_DARK, bold=True, align=PP_ALIGN.CENTER)


# ==================================================
# SLIDE 10: PENUTUP
# ==================================================
sl = prs.slides.add_slide(prs.slide_layouts[6])
add_gradient_rect(sl, 0, 0, SW, SH, BLUE_DARK, RGBColor(0x0F, 0x25, 0x40))

deco3 = sl.shapes.add_shape(MSO_SHAPE.OVAL, Inches(8.5), Inches(3.5), Inches(6), Inches(6))
deco3.fill.solid()
deco3.fill.fore_color.rgb = RGBColor(0x2B, 0x4F, 0x7F)
deco3.line.fill.background()

deco4 = sl.shapes.add_shape(MSO_SHAPE.OVAL, Inches(-2), Inches(-2), Inches(5), Inches(5))
deco4.fill.solid()
deco4.fill.fore_color.rgb = RGBColor(0x1A, 0x30, 0x50)
deco4.line.fill.background()

add_text_box(sl, Inches(1.5), Inches(1.8), Inches(10), Inches(1.0),
             "Terima Kasih", size=48, color=WHITE, bold=True, align=PP_ALIGN.CENTER)

line2 = sl.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(5.5), Inches(3.0), Inches(2.3), Pt(3))
line2.fill.solid()
line2.fill.fore_color.rgb = BLUE_LIGHT
line2.line.fill.background()

add_text_box(sl, Inches(1.5), Inches(3.4), Inches(10), Inches(0.8),
             "SmartPark  -  Sistem Manajemen Parkir Cerdas & Modern",
             size=20, color=RGBColor(0xA0, 0xC4, 0xF0), align=PP_ALIGN.CENTER)

add_text_box(sl, Inches(1.5), Inches(4.5), Inches(10), Inches(0.8),
             "Kelola parkir lebih mudah, cepat, dan akurat\ndengan teknologi digital dan kecerdasan buatan.",
             size=15, color=RGBColor(0x80, 0xA0, 0xC0), align=PP_ALIGN.CENTER)

add_text_box(sl, Inches(1.5), Inches(5.8), Inches(10), Inches(0.6),
             "github.com/HumamasyariDev/humanityalok",
             size=13, color=RGBColor(0x70, 0x90, 0xB0), align=PP_ALIGN.CENTER)

add_text_box(sl, Inches(1.5), Inches(6.3), Inches(10), Inches(0.5),
             "HumamasyariDev  -  2026",
             size=13, color=RGBColor(0x60, 0x80, 0xA0), align=PP_ALIGN.CENTER)


# -- Save --
output_path = r"C:\laragon\www\humanityalok\SmartPark_Presentasi.pptx"
prs.save(output_path)
print(f"PPT berhasil dibuat: {output_path}")
print(f"Total slides: {len(prs.slides)}")
