# コマンド集


declare -a array=("tokyo003-10g" "tokyo005-10g" "tokyo006-10g" "tokyo007-10g" "tokyo008-10g" "tokyo009-10g" "tokyo010-10g" "tokyo022-10g" "tokyo023-10g" "tokyo024-10g" "tokyo025-10g" "tokyo026-10g" "tokyo027-10g" "tokyo028-10g" "tokyo029-10g" "tokyo030-10g") 
for i in "${!array[@]}"
do
    echo ${array[$i]}
    ssh ${array[$i]}  "rm -rf $PTWEET_LOCAL/*" 
done
rm -rf /data/str01_03/twitter/shohei/result/*

# 全ノードの一時ファイルを消す
declare -a array=("tokyo013-10g" "tokyo014-10g" "tokyo017-10g" "tokyo016-10g" "tokyo015-10g" "tokyo009-10g" "tokyo008-10g" "tokyo030-10g" "tokyo028-10g" "tokyo026-10g" "tokyo006-10g" "tokyo010-10g" "tokyo027-10g" "tokyo005-10g" "tokyo029-10g" "tokyo007-10g")
for i in "${!array[@]}"
do
    echo ${array[$i]}
    ssh ${array[$i]}  "rm -rf $PTWEET_LOCAL/*"
done


declare -a array=("tokyo003-10g" "tokyo005-10g" "tokyo006-10g" "tokyo007-10g" "tokyo008-10g" "tokyo009-10g" "tokyo010-10g" "tokyo022-10g" "tokyo023-10g" "tokyo024-10g" "tokyo025-10g" "tokyo026-10g" "tokyo027-10g" "tokyo028-10g" "tokyo029-10g" "tokyo030-10g") 
for i in "${!array[@]}"
do
    echo ${array[$i]}
    ssh ${array[$i]}  "ps -aux | grep node | grep -v grep  | awk '{ print \"kill -9\", \$2 }' | sh"
done

```
ssh tokyo003-10g  "tail -n 1 $PTWEET_LOCAL/out_tokyo003-10g.txt" 
ssh tokyo005-10g  "tail -n 1 $PTWEET_LOCAL/out_tokyo005-10g.txt"
ssh tokyo006-10g  tail -n 1 $PTWEET_LOCAL/out_tokyo006-10g.txt
ssh tokyo007-10g  tail -n 1 $PTWEET_LOCAL/out_tokyo007-10g.txt
ssh tokyo008-10g  tail -n 1 $PTWEET_LOCAL/out_tokyo008-10g.txt
ssh tokyo009-10g  tail -n 1 $PTWEET_LOCAL/out_tokyo009-10g.txt
ssh tokyo010-10g  tail -n 1 $PTWEET_LOCAL/out_tokyo010-10g.txt
ssh tokyo022-10g  tail -n 1 $PTWEET_LOCAL/out_tokyo022-10g.txt
ssh tokyo023-10g  tail -n 1 $PTWEET_LOCAL/out_tokyo023-10g.txt
ssh tokyo024-10g  tail -n 1 $PTWEET_LOCAL/out_tokyo024-10g.txt
ssh tokyo025-10g  tail -n 1 $PTWEET_LOCAL/out_tokyo025-10g.txt
ssh tokyo026-10g  tail -n 1 $PTWEET_LOCAL/out_tokyo026-10g.txt
ssh tokyo027-10g  tail -n 1 $PTWEET_LOCAL/out_tokyo027-10g.txt
ssh tokyo028-10g  tail -n 1 $PTWEET_LOCAL/out_tokyo028-10g.txt
ssh tokyo029-10g  tail -n 1 $PTWEET_LOCAL/out_tokyo029-10g.txt
ssh tokyo030-10g  tail -n 1 $PTWEET_LOCAL/out_tokyo030-10g.txt
```

```
node instant.mjs --id testquery --term 2021/10/01T00:00-2021/10/05T00:00 --keywords コロナ マスク --url ws://tokyo004:45803/ --webdav --destination https://file.tmu.ac:4580/home/Drive/labo/twitter/ --user shohei.yokoyama
```

```
npx -y -p exhaustive-twitter-crawler -- instant --id testwebdav --term 2021/10/31T00:00-2021/11/02T00:00 --keywords ハロウィン --url ws://tokyo004:45803/ --giveaway webdav --destination https://file.tmu.ac:4580/home/Drive/labo/twitter/ --user shohei.yokoyama
```


```
npx -y -p exhaustive-twitter-crawler -- instant --id testlocal --term 2021/10/31T21:00-2021/11/01T03:00 --keywords ハロウィン --url ws://tokyo004:45803/ --giveaway local --destination $WORK/output --jst
```

```
npx -y -p exhaustive-twitter-crawler -- instant --id kurouzu-drink --term 2021/01/01T00:00-2022/01/01T00:00 --keywords 🍺 🍻 🍷 🥂 🍶 🍸 🍹 🏮 🍾 🥃 --keywords-match text-or --url ws://tokyo004:45803/ --giveaway local --destination $WORK/output --jst --mask id_str,user\(id_str,name,screen_name\),text,created_at,timestamp_ms
```


```
npx -y -p exhaustive-twitter-crawler -- instant --id shohei-ki --term 2022/01/01T00:00-2022/01/02T00:00 --keywords 😀 😃 😄 😁 😆 --keywords-match text-or --url ws://tokyo004:45803/ --giveaway local --destination $WORK/output --jst --mask id_str,user\(id_str,name,screen_name\),text,created_at,timestamp_ms
```

```
npx -y -p exhaustive-twitter-crawler -- instant --id shohei-vaccine --term 2021/01/01T00:00-2022/01/01T00:00 --keywords 😤 ワクチン --keywords-match text-and --url ws://tokyo004:45803/ --giveaway local --destination $WORK/output --jst --mask id_str,user\(id_str,name,screen_name\),text,created_at,timestamp_ms
```

```
npx -y -p exhaustive-twitter-crawler -- instant --id shohei-ai --term 2022/01/01T00:00-2022/01/02T00:00 --keywords 😭 😱 😢 😥 --keywords-match text-or --url ws://tokyo004:45803/ --giveaway local --destination $WORK/output --jst --mask id_str,user\(id_str,name,screen_name\),text,created_at,timestamp_ms
```
```
npx -y -p exhaustive-twitter-crawler -- instant --id shohei-1-mask --term 2021/12/20T00:00-2022/01/10T00:00 --keywords 😷 --keywords-match text-or --url ws://tokyo004:45803/ --giveaway local --destination $WORK/output --jst --mask id_str,user\(id_str,name,screen_name\),text,created_at,timestamp_ms
```

```
npx -y -p exhaustive-twitter-crawler -- instant --id shohei-1-netsu --term 2021/12/20T00:00-2022/01/10T00:00 --keywords 🤒 --keywords-match text-or --url ws://tokyo004:45803/ --giveaway local --destination $WORK/output --jst --mask id_str,user\(id_str,name,screen_name\),text,created_at,timestamp_ms
```

```
npx -y -p exhaustive-twitter-crawler -- instant --id shohei-1-party --term 2021/12/20T00:00-2022/01/10T00:00 --keywords 🥳 --keywords-match text-or --url ws://tokyo004:45803/ --giveaway local --destination $WORK/output --jst --mask id_str,user\(id_str,name,screen_name\),text,created_at,timestamp_ms
```
```
npx -y -p exhaustive-twitter-crawler -- instant --id shohei-1-yuki --term 2021/12/20T00:00-2022/01/10T00:00 --keywords ❄️ 🌨️ ⛄ ☃️ --keywords-match text-or --url ws://tokyo004:45803/ --giveaway local --destination $WORK/output --jst --mask id_str,user\(id_str,name,screen_name\),text,created_at,timestamp_ms
```

```
npx -y -p exhaustive-twitter-crawler -- instant --id eguchi_fox2 --term 2020/10/01T00:00-2020/12/01T00:00 --keywords election Trump Biden --keywords-match text-or --mask created_at,timestamp_ms,id_str,text,user\(id_str,name\),extended_tweet\(full_text\),entities\(hashtags,urls\),retweeted_status\(id_str,user\(id_str,name\),text,entities\(hashtags,urls\),created_at\) --url ws://tokyo004:45803/ --giveaway local --destination $WORK/output --jst
```

```
npx -y -p exhaustive-twitter-crawler -- instant --id narita2022 --term 2022/01/01T00:00-2022/01/02T00:00 --keywords コロナ 新型肺炎 COVID-19 --keywords-match text-or --lang ja --mask id_str,user\(id_str\),retweeted_status\(text,id_str,user\(id_str\),created_at\),created_at,timestamp_ms --lang ja --only-retweet --jst --url ws://tokyo004:45803/ --giveaway local --destination $WORK/output/
```

```
npx -y -p exhaustive-twitter-crawler -- instant --id kurouzu-ukraine --term 2022/02/20T00:00-2022/02/21T00:00 --keywords [[\"ゼレンスキー\",\"合成\"],[\"ゼレンスキー\",\"フェイク\"]] --keywords-match text-and --mask text,id,user\(id\),created_at,timestamp_ms,retweeted_status\(text,id_str,user\(id_str\),created_at\) --url ws://tokyo004:45803/ --giveaway local --destination $WORK/output/



npx -y -p exhaustive-twitter-crawler -- instant --id kurouzu-ukraine-or --term 2022/02/20T00:00-2022/04/01T00:00 --keywords [[\"ゼレンスキー\",\"合成\"],[\"ゼレンスキー\",\"フェイク\"]] --keywords-match text-or --mask text,id,user\(id\),created_at,timestamp_ms,retweeted_status\(text,id_str,user\(id_str\),created_at\) --url ws://tokyo004:45803/ --giveaway webdav --destination https://file.tmu.ac:4580/home/Drive/labo/twitter/ --user shohei.yokoyama

npx -y -p exhaustive-twitter-crawler -- instant --id april-fool --term 2022/04/01T00:00-2022/04/02T00:00 --keywords エイプリルフール --keywords-match text-or --mask text,id,user\(id\),created_at,timestamp_ms,retweeted_status\(text,id_str,user\(id_str\),created_at\) --url wss://tokyo.jp.ngrok.io --giveaway webdav --destination https://file.yokoyama.ac:4580/twitter --user yokoyamalab --token  TKN7GnAzUAzVWJfpb4S


npx -y -p exhaustive-twitter-crawler -- instant --id kurouzu-tokyo0202-or --term 2021/04/01T00:00-2021/10/01T00:00 --keywords [[\"東京五輪\",\"無観客\"],[\"東京五輪\",\"有観客\"],[\"オリンピック\",\"無観客\"],[\"オリンピック\",\"有観客\"],[\"tokyo2020\",\"無観客\"],[\"tokyo2020\",\"有観客\"]] --keywords-match text-or --mask text,id,user\(id\),created_at,timestamp_ms,retweeted_status\(text,id_str,user\(id_str\),created_at\) --url ws://tokyo004:45803/ --giveaway webdav --destination https://file.tmu.ac:4580/home/Drive/labo/twitter/ --user shohei.yokoyama
```

```
npx -y -p exhaustive-twitter-crawler@latest instant --term 2022-02-20T00:00~2022-04-08T00:00 --no-keywords --has-geo --giveaway here --id has-geo --giveaway webdav --destination https://file.tmu.ac:4580/home/Drive/labo/twitter/ --user shohei.yokoyama
```
npm deprecate exhaustive-twitter-crawler@"< 0.3" "super buggy versions < v0.3.x"

```
read -p "Please enter the file name: " __file
read -p "Please enter your name: " __user
read -sp "Please enter your password: " __pass; echo
curl -K- -T ${__file} --url https://file.tmu.ac:4580/home/Drive/labo/twitter/  -X PUT <<< "-u ${__user}:${__pass}" | tee -a "${LOG_FILE}" ; test ${PIPESTATUS[0]} -eq 0
```

```
nohup "curl -K- -T ${__file} --url https://file.tmu.ac:4580/home/Drive/labo/twitter/  -X PUT <<< \"-u ${__user}:${__pass}\"" &
```
