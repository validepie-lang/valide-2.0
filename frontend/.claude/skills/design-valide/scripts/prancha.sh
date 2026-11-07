#!/bin/bash
# uso: prancha.sh <pasta-das-capturas> <saida.png> <colunas> <largura-de-cada> <arquivo.png> [arquivo.png...]
# Junta capturas lado a lado numa imagem só, para comparar telas de uma vez.
# Não precisa de PIL nem ImageMagick: monta um HTML e fotografa com o Chrome.
DIR="$1"; OUT="$2"; COLS="$3"; IW="$4"; shift 4
CH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
W=$(( COLS * (IW + 6) + 12 ))
HTML="${OUT%.png}.html"
{
  echo "<!doctype html><body style='margin:0;background:#888;display:grid;grid-template-columns:repeat($COLS,${IW}px);gap:6px;padding:6px;font:12px sans-serif'>"
  for f in "$@"; do
    echo "<div><div style='background:#000;color:#fff;padding:2px 4px'>$(basename "$f" .png)</div><img src='file://$DIR/$f' style='width:${IW}px;display:block'></div>"
  done
  echo "</body>"
} > "$HTML"
"$CH" --headless=new --disable-gpu --hide-scrollbars --virtual-time-budget=4000 --window-size=$W,1250 --screenshot="$OUT" "file://$HTML" >/dev/null 2>&1
echo "$OUT"
