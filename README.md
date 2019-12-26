# ptt-monitor

監控票券板是否有要搶的票
有的話用及時用line通知

## 配置line
1. [line notify](https://notify-bot.line.me/zh_TW/)
2. 登入後右上角點個人頁面
3. 按發行權杖
4. 輸入通知名稱然後選擇1對1聊天接收
5. 複製key到config.json的line notify

## 配置監控參數
1. 打開config.json
2. board填入要追蹤的板
3. targets.or決定要找的關鍵字 有1個符合就通過
4. targets.and決定要找的關鍵字 全部符合才通過

## 開始監控
1. 下指令 `node drama`