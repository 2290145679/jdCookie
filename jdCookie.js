/*
================================================================================
ħ���� https://github.com/shufflewzc/faker2/blob/main/jdCookie.js
�޸����ݣ���task_before.sh��ϣ���task_before.sh����Ҫ����Ҫ�������Ļ�� ShareCodeConfigName �� ShareCodeEnvName ����������
        Ȼ��������ʵ�ʽ���/ql/log/.ShareCode�иû��Ӧ��������Ϣ����code.sh���ɺ�ά������ע�뵽nodejs�Ļ���������
�޸�ԭ��ԭ�ȵ�task_before.shֱ�ӽ�������Ϣע�뵽shell��env�У���ck����45����ʱ�������뻷����������ᵼ�µ���һЩϵͳ����
        ����date/cat��ʱ�� Argument list too long������node���޸Ļ�������������������ƣ�Ҳ����Ӱ���ⲿshell������ȷ���ű�������������
ħ�����ߣ���֮����
================================================================================

���ļ�ΪNode.jsר�á������û������
 */
//�˴���д�����˺�cookie��
let CookieJDs = [
]
// �жϻ������������Ƿ��о���ck
if (process.env.JD_COOKIE) {
  if (process.env.JD_COOKIE.indexOf('&') > -1) {
    CookieJDs = process.env.JD_COOKIE.split('&');
  } else if (process.env.JD_COOKIE.indexOf('\n') > -1) {
    CookieJDs = process.env.JD_COOKIE.split('\n');
  } else {
    CookieJDs = [process.env.JD_COOKIE];
  }
}
if (JSON.stringify(process.env).indexOf('GITHUB')>-1) {
  console.log(`����ʹ��github action���д˽ű�,�������Ǵ����Լ���˽�⻹������������ȡ��Դ���룬���ᵼ���ұ����\n`);
  !(async () => {
    await require('./sendNotify').sendNotify('����', `����ʹ��github action������github��Դ����Ҳֿ��Լ��˺�`)
    await process.exit(0);
  })()
}
CookieJDs = [...new Set(CookieJDs.filter(item => !!item))]
console.log(`\n====================��${CookieJDs.length}�������˺�Cookie=========\n`);
console.log(`==================�ű�ִ��- ����ʱ��(UTC+8)��${new Date(new Date().getTime() + new Date().getTimezoneOffset()*60*1000 + 8*60*60*1000).toLocaleString('zh', {hour12: false}).replace(' 24:',' 00:')}=====================\n`)
if (process.env.JD_DEBUG && process.env.JD_DEBUG === 'false') console.log = () => {};
for (let i = 0; i < CookieJDs.length; i++) {
  if (!CookieJDs[i].match(/pt_pin=(.+?);/) || !CookieJDs[i].match(/pt_key=(.+?);/)) console.log(`\n��ʾ:����cookie ��${CookieJDs[i]}����д���淶,���ܻ�Ӱ�첿�ֽű�����ʹ�á���ȷ��ʽΪ: pt_key=xxx;pt_pin=xxx;���ֺ�;�����٣�\n`);
  const index = (i + 1 === 1) ? '' : (i + 1);
  exports['CookieJD' + index] = CookieJDs[i].trim();
}

// ����Ϊע�뻥���뻷����������nodejs����Ч���Ĵ���
function SetShareCodesEnv(nameConfig = "", envName = "") {
    let rawCodeConfig = {}

    // ��ȡ������
    shareCodeLogPath = `${process.env.QL_DIR}/log/.ShareCode/${nameConfig}.log`
    let fs = require('fs')
    if (fs.existsSync(shareCodeLogPath)) {
        // ��Ϊfaker2Ŀǰû���Դ�ini���������е�dotenv������
        // // ����iniģ���ȡԭʼ������ͻ�������Ϣ
        // let ini = require('ini')
        // rawCodeConfig = ini.parse(fs.readFileSync(shareCodeLogPath, 'utf-8'))

        // ʹ��envģ��
        require('dotenv').config({path: shareCodeLogPath})
        rawCodeConfig = process.env
    }

    // ����ÿ���û��Ļ�����
    codes = {}
    Object.keys(rawCodeConfig).forEach(function (key) {
        if (key.startsWith(`My${nameConfig}`)) {
            codes[key] = rawCodeConfig[key]
        }
    });

    // ����ÿ���û�Ҫ�����Ļ������飬���û�ʵ�ʵĻ���������ȥ
    let helpOtherCodes = {}
    Object.keys(rawCodeConfig).forEach(function (key) {
        if (key.startsWith(`ForOther${nameConfig}`)) {
            helpCode = rawCodeConfig[key]
            for (const [codeEnv, codeVal] of Object.entries(codes)) {
                helpCode = helpCode.replace("${" + codeEnv + "}", codeVal)
            }

            helpOtherCodes[key] = helpCode
        }
    });

    // ��˳����&ƴ�յ�һ�𣬲����뻷����������Ŀ��ű�ʹ��
    let shareCodes = []
    let totalCodeCount = Object.keys(helpOtherCodes).length
    for (let idx = 1; idx <= totalCodeCount; idx++) {
        shareCodes.push(helpOtherCodes[`ForOther${nameConfig}${idx}`])
    }
    let shareCodesStr = shareCodes.join('&')
    process.env[envName] = shareCodesStr

    console.info(`����֮���䡿 ������ʾ��Ϊ����ck����45����ʱ�������뻷��������������µ���һЩϵͳ�����date/cat��ʱ�� Argument list too long����Ϊ��nodejs������ ${nameConfig} �� �����뻷������ ${envName}������ ${totalCodeCount} �黥���룬�ܴ�СΪ ${shareCodesStr.length}`)
}

// ����task_before.sh ��������Ҫ���û����뻷�������Ļ���ƺͻ�������������Ϣ������nodejs�д������ʹ��
let nameConfig = process.env.ShareCodeConfigName
let envName = process.env.ShareCodeEnvName
if (nameConfig && envName) {
    SetShareCodesEnv(nameConfig, envName)
} else {
    console.debug(`����֮���䡿 ������ʾ����ǰδ���� ShareCodeConfigName �� ShareCodeEnvName ���������������᳢����nodejs�����ɻ�����Ļ���������ps: ����ֵĿǰ�ֱ�Ϊ ${nameConfig} ${envName}`)
}