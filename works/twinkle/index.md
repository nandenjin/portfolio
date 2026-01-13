---
title_en: Twinkle
title_ja: Twinkle
creator: Kazumi Inada
materials: Web Service
year: 2019
tags: web design branding
info:
thumbnail: /works/twinkle/twinkle_thumb.png
release: 2019-04-01
---

![](/works/twinkle/twinkle_thumb.png)
![](/works/twinkle/twinkle_device.png)
![](/works/twinkle/twinkle_screenshot.png)

筑波大学の科目番号を入力することで、その授業の開講時間をGoogleカレンダーに自動で登録するWebサービス。

先行するiCalendar用の類似サービス[TwinCal](https://cal.tsukuba.io)のコンセプトを引き継いで、Googleカレンダーで利用しやすくしたもの。ユーザーが行う作業はTwinkleのサイト上で科目を登録するのみで、Googleカレンダーの操作はフルマネージドに自動化される。この特性を活かし、インタラクティブな操作や学年暦を元にした曜日振替の反映、サービス外から手動で追加されたイベントとの混在など、TwinCalには存在しなかった機能を実現している。

## Resources

- [Twinkle](https://twinkle.nandenjin.com)
- [twinkle-parser](https://github.com/nandenjin/twinkle-parser): 大学の教育課程編成システム（KDB）からダウンロードできるCSVデータを、構造化されたJSONデータに変換するツール。Twinkleのコード中このパーサー部分のみを公開することで、サービス自体のセキュリティを維持しつつ、開講曜日・時限などの誤変換バグの修正を迅速化することを狙った。
