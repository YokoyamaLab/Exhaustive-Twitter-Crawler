# Twitter全量検索

> 注意）このプログラムは特定の環境でしか動作しません。

## コマンド: instant

コマンドライン引数に検索条件などをすべて指定して、一気に結果集約・圧縮・指定場所にアップロードまで行う。

```
npx -p exhaustive-twitter-crawler -- instant <option>
```

### 実行例(ローカルアクセス)
  
* 2021年10月25日から11月4日においてハロウィンもしくは仮装が含まれた日本語のツイートのうちリツイートではないものを検索し--destinationで指定したWebDAVサーバへアップロードしたい。(Queryサーバ(--url)のURLは管理者から配布する)
```
npx -y -p exhaustive-twitter-crawler instant --id yokoyama20211208 --term 2022-10-25T00:00~2021-11-05T00:00 --keywords ハロウィン 仮装 --keywords-match text-or --ignore-retweet --url wss://query-server:1111/ --webdav --destination https://web-dav-server:2222/result/ --user username-for-web-dav-server
```

### 実行例(外部サーバから)

| セキュリティ上、利用者を限定するために、tokenを用いたクエリ認可の仕組みがあります。クエリを発行する前に、以下の手順に従い管理者からtokensを発行してもらう必要があります。

* まず自分のClient IDを取得する
```
npx -y -p exhaustive-twitter-crawler -- get-id
```
* IDが画面に表示されるのでそれをサーバ担当へ通知しトークンをもらう。
* トークン一つにつき一つのクエリが出来ます。またget-idを行った環境からのみ有効です。
* tokenを以下の**様な**コマンドで登録する。(実際のコマンドは管理者から与えられます。)

```
npx -y -p exhaustive-twitter-crawler@latest set-tokens <ここにTokenが_区切りで入る>
```

* クエリを発行する。(クエリ発行の度にtokenは一つずつ消費されます)
* 【方法１】自分が管理しているどこかのWebDAVサーバへアップロードする場合(WebDAVサーバは自前で準備する必要があります。)

```
npx -y -p exhaustive-twitter-crawler -- instant --term 2022-04-01T00:00~2022-04-02T00:00 --keywords エイプリルフール --giveaway webdav --destination https://web-dav-server:2222/result/ --user shohei --id april-fool
```

* 【方法２】クエリを発行しているコンピュータに結果を取り寄せる(結果ファイルの転送時間はWebDAVサーバへアップロードするよりかかります)
  
```
npx -y -p exhaustive-twitter-crawler -- instant --term 2022-04-01T00:00~2022-04-02T00:00 --keywords エイプリルフール --keywords-match text-or --id april-fool
```

* 結果は**apil-fool-YYYYMMDDHHMMSS.tar.gz**というファイル名で保存されます。
  * YYYYMMDDHHMMSSは結果作成時の時刻


### オプション

#### 全体関連

| スイッチ  | 例 | 説明 |
| ------------- | ------------- | ------------- |
| --id \<identifier\>   | my-query | 〈必須〉クエリ識別ID (ファイル名に使える文字のみ)  |
| --url \<url\>         | wss://query-server:1111/ | デフォルトと異なるサーバを指定したいときのみ |
| --giveaway \<method\> | no | 結果の送信方法(no, local, webdav, curl) |
| --token \<token\> |  | リモートアクセス時に必要なアクセストークン |

#### 検索関連

| スイッチ  | 例 | 説明 |
| ------------- | ------------- | ------------- |
| --term \<from-to\>    | 2020-05-01T00:00~2021-07-01T00:00 | 〈必須1〉クロール期間(最初と最後)をチルダ(~)区切りのISO8601形式にて指定  |
| --keywords            | コロナ マスク 自粛 | 〈必須2〉キーワードリスト(半角スペース区切りもしくはJSON) |
| --no-keywords         | | 〈必須2〉keywordsを指定しない時は必ず--no-keywordsを指定する(全量取得するので注意！) |
| --keywords-match      | text-or | キーワードのOR検索(text-or)かAND検索(text-and)かを指定、RegExpで正規表現も可 |
| --lang \<lang\>       | | 言語(jaとenのみ対応、無指定は全ツイード) |
| --ignore-retweet      | | リツイートを結果に含めない |
| --only-retweet        | | リツイートのみ取得する |
| --only-quote          | | 引用リツイートのみ取得する |
| --has-geo             | | ジオタグ付きTweetのみ |
| --has-geo-point       | | ジオタグ付きTweetのみ(Pointを持つもの限定) |
| --jst                 | | create_atを日本時間にする |
| --mask \<mask\>       | id_str,text,user(id_str,name,screen_name) | 結果に残すJSONフィールドの指定([書き方](https://www.npmjs.com/package/json-mask)) |
| --verbose             | | 結果にエラーやファイル毎統計情報を含める |
| --boost               | | (β版)検索を高速にする(JSONパース前に文字列一致を行う事で検索を高速化します)

* `mask`の指定がない場合はデフォルトで以下のマスクがかけられます。
  * `id_str,text,user(id_str,name,screen_name),is_quote_status,quoted_status_id_str,retweeted_status(id_str,user(id_str,name,screen_name)),entities(hashtags,user_mentions,urls),lang,timestamp_ms,created_at`
* `keywords`は`keywords-match`が`text-or`の時、`[[\"A\",\"B\"],[\"C\",\"D\"]]`と指定する事で、 **(A and B) or (C and D)** と解釈されます。`text-and`の時は **(A or B) and (C or D)** となります。

#### 結果取得( `--giveaway local` の場合)

| スイッチ  | 例 | 説明 |
| ------------- | ------------- | ------------- |
| --destination \<path\> | ~/exhaustive-twitter/ | tokyo012上でtwitterguestsグループが書き込める)保存先ディレクトリ | 

#### 結果取得( `--giveaway webdav` の場合)

| スイッチ  | 例 | 説明 |
| ------------- | ------------- | ------------- |
| --destination \<url\> | https://web-dav-server:2222/paht/to/dir/ | アップロード先(WebDAVのURL) | 
| --user  \<username\>  | shohei | WebDAVサーバにログインするユーザ名(パスワードは実行後に聞かれます)