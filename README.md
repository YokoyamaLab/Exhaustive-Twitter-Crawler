# Twitter全量検索

> 注意）このプログラムは特定の環境でしか動作しません。

## 使い方
```
npx parallel-full-twitter instant <option>
```

### オプション

| スイッチ  | 例 | 説明 |
| ------------- | ------------- | ------------- |
| --id \<identifier\>   | my-query | 〈必須〉クエリ識別ID (ファイル名に使える文字のみ)  |
| --url \<url\>         | wss://query-server:1111/ | 〈必須〉全量解析サーバ(URLは管理者に聞いてください) |
| --term \<from-to\>    | 2020/05/01T00:00-2021/07/01T00:00 | 〈必須〉クロール期間 YYYY/MM/DDTHH:MMにて指定  |
| --keywords            | コロナ マスク 自粛 | 〈必須〉キーワードリスト(半角スペース区切り) |
| --keywords-match      | text-or | キーワードのOR検索(text-or)かAND検索(text-and)かを指定、RegExpで正規表現も可 |
| --lang \<lang\>       | ja | 言語(jaとenのみ対応、無指定も可) |
| --ignore-retweet      | | リツイートを結果に含めない |
| --only-retweet        | | リツイートのみ取得する |
| --mask \<mask\>       | id_str,text,user(id_str,name,screen_name) | 結果に残すJSONフィールドの指定([書き方](https://www.npmjs.com/package/json-mask)) |
| --webdav              | | 結果をWebDAVにアップロードする |
| --destination \<url\> | https://web-dav-server:2222/paht/to/dir/ | アップロード先(WebDAVのURL) | 
| --user  \<username\>  | shohei | WebDAVサーバにログインするユーザ名(パスワードは実行後に聞かれます)

* `mask`の指定がない場合はデフォルトで以下のマスクがかけられます。
  * `id_str,text,user(id_str,name,screen_name),is_quote_status,quoted_status_id_str,retweeted_status(id_str,user(id_str,name,screen_name)),entities(hashtags,user_mentions,urls),lang,timestamp_ms,created_at`

###　実行例
  
* 2021年10月25日から11月4日においてハロウィンもしくはコロナが含まれた日本語のツイートのうちリツイートではないものを検索しWebDAVサーバへアップロードしたい。
```
npx parallel-full-twitter instant --id yokoyama20211208 --term 2021/10/25T00:00-2021/11/5T00:00 --keywords ハロウィン 仮装 --keywords-match text-or --ignore-retweet --url wss://query-server:1111/ --webdav --destination https://web-dav-server:2222/result/ --user shohei
```