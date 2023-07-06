# TrackWatch
오버워치 2의 패치 노트와 상점 정보를 가져오는 디스코드 봇입니다

## 사용법
먼저 설정 파일의 이름을 `config.json`으로 바꾸시고, 설정 파일을 열어서 각 항목에 맞게 수정해 주시면 됩니다. 항목은 다음과 같습니다
* token - 디스코드 봇의 토큰 값
* clientId - 디스코드 봇의 클라이언트 ID 값
* guildId - 디스코드 서버의 ID 값
* shopchannel - 상점 정보의 메시지를 보낼 채널의 ID 값
* patchchannel - 패치 노트 정보의 메시지를 보낼 채널의 ID 값

그 후 이제 `node index.js` 명령어로 실행하면 완료됩니다