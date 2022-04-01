# Twitter全量検索

> 注意）このプログラムは特定の環境でしか動作しません。

## コマンド: instant

　コマンドライン引数に検索条件などをすべて指定して、一気に結果集約・圧縮・指定場所にアップロードまで行う。

```え
npx -p exhaustive-twitter-crawler -- instant <option>
```

### オプション

#### 全体関連

| スイッチ  | 例(初期値) | 説明 |
| ------------- | ------------- | ------------- |
| --id \<identifier\>   | my-query | 〈必須〉クエリ識別ID (ファイル名に使える文字のみ)  |
| --url \<url\>         | wss://query-server:1111/ | 〈必須〉全量処理サーバ(URLは管理者に聞いてください) |
| --output \<format\>   |  daily | 結果フォーマット、日毎1ファイル(daily)もしくはアーカイブそのまま(as-is) |
| --giveaway \<method\> | no | 結果の送信方法(no, local, webdav, curl)
| --notification \<email\> |  | 処理進行を通知するメールアドレス

#### 検索関連

| スイッチ  | 例(初期値) | 説明 |
| ------------- | ------------- | ------------- |
| --term \<from-to\>    | 2020/05/01T00:00-2021/07/01T00:00 | 〈必須〉クロール期間 YYYY/MM/DDTHH:MMにて指定  |
| --keywords            | コロナ マスク 自粛 | 〈必須〉キーワードリスト(半角スペース区切りもしくはJSON) |
| --keywords-match      | text-or | キーワードのOR検索(text-or)かAND検索(text-and)かを指定、RegExpで正規表現も可 |
| --lang \<lang\>       | ja | 言語(jaとenのみ対応、無指定も可) |
| --ignore-retweet      | | リツイートを結果に含めない |
| --only-retweet        | | リツイートのみ取得する |
| --jst                 | | create_atを日本時間にする |
| --mask \<mask\>       | id_str,text,user(id_str,name,screen_name) | 結果に残すJSONフィールドの指定([書き方](https://www.npmjs.com/package/json-mask)) |
| --verbose             | | 結果にエラーやファイル毎統計情報を含める |

* `mask`の指定がない場合はデフォルトで以下のマスクがかけられます。
  * `id_str,text,user(id_str,name,screen_name),is_quote_status,quoted_status_id_str,retweeted_status(id_str,user(id_str,name,screen_name)),entities(hashtags,user_mentions,urls),lang,timestamp_ms,created_at`
* `keywords`は`keywords-match`が`text-or`の時、`[[\"A\",\"B\"],[\"C\",\"D\"]]`と指定する事で、 **(A and B) or (C and D)** と解釈されます。`text-and`の時は **(A or B) and (C or D)** となります。

#### 結果取得( `--giveaway local` の場合)

| スイッチ  | 例(初期値) | 説明 |
| ------------- | ------------- | ------------- |
| --destination \<path\> | ~/exhaustive-twitter/ | (同サーバ上でtwitterguestsグループが書き込める)保存先ディレクトリ | 

#### 結果取得( `--giveaway webdav` の場合)

| スイッチ  | 例(初期値) | 説明 |
| ------------- | ------------- | ------------- |
| --destination \<url\> | https://web-dav-server:2222/paht/to/dir/ | アップロード先(WebDAVのURL) | 
| --user  \<username\>  | shohei | WebDAVサーバにログインするユーザ名(パスワードは実行後に聞かれます)

### 実行例
  
* 2021年10月25日から11月4日においてハロウィンもしくはコロナが含まれた日本語のツイートのうちリツイートではないものを検索しWebDAVサーバへアップロードしたい。
```
npx -p exhaustive-twitter-crawler instant --id yokoyama20211208 --term 2021/10/25T00:00-2021/11/5T00:00 --keywords ハロウィン 仮装 --keywords-match text-or --ignore-retweet --url wss://query-server:1111/ --webdav --destination https://web-dav-server:2222/result/ --user shohei
```