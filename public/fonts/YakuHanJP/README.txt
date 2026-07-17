YakuHanJP（約物半角フォント）
================================

このフォルダのフォントは、句読点・カッコなどの「約物」だけを収録した
サブセットフォントです。本文の文字そのものは含まれていません。
Noto Sans JP と組み合わせて、約物の前後の余白を詰める目的で使用しています。

ホワイト急便グループ本部サイト（www.white-ex.co.jp）が採用しているものと
同じフォントです。

  収録ウェイト : Regular(400) / Medium(500) / Bold(700) / Black(900)
  合計サイズ   : 約 15KB

出所とライセンス
----------------
  制作     : Qrac ( https://qrac.jp )
  公式サイト : https://yakuhanjp.qranoko.jp
  リポジトリ : https://github.com/qrac/yakuhanjp
  ライセンス : SIL Open Font License 1.1 および MIT License
               （ライセンス全文は上記リポジトリを参照してください）

  ベースフォント : Source Han Sans / 源ノ角ゴシック (Adobe, SIL OFL 1.1)

更新のしかた
------------
  npm パッケージ yakuhanjp からファイルをコピーしています。
  更新する場合はプロジェクトのルートで以下を実行してください。

    npm i -D yakuhanjp
    copy node_modules\yakuhanjp\dist\fonts\YakuHanJP\YakuHanJP-Regular.woff2 public\fonts\YakuHanJP\
    copy node_modules\yakuhanjp\dist\fonts\YakuHanJP\YakuHanJP-Medium.woff2  public\fonts\YakuHanJP\
    copy node_modules\yakuhanjp\dist\fonts\YakuHanJP\YakuHanJP-Bold.woff2    public\fonts\YakuHanJP\
    copy node_modules\yakuhanjp\dist\fonts\YakuHanJP\YakuHanJP-Black.woff2   public\fonts\YakuHanJP\

  @font-face の定義は src/styles/global.css の先頭にあります。
