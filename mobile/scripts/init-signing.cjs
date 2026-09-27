// Generate a stable prototype release certificate outside the Git repository.
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),crypto=require('node:crypto'),{execFileSync}=require('node:child_process');
const home=process.env.TRIPWONDER_SIGNING_HOME||path.join(os.homedir(),'.tripwonder','signing');
const java=process.env.JAVA_HOME;if(!java)throw Error('Set JAVA_HOME to JDK 21 first.');
fs.mkdirSync(home,{recursive:true});
const secretsFile=path.join(home,'android-release.json'),storeFile=path.join(home,'android-release.p12');
let secrets;
if(fs.existsSync(secretsFile))secrets=JSON.parse(fs.readFileSync(secretsFile));
else{
 if(fs.existsSync(storeFile))throw Error('Keystore exists without its password file. Restore credentials; do not replace it.');
 secrets={password:crypto.randomBytes(32).toString('base64url')};fs.writeFileSync(secretsFile,JSON.stringify(secrets),{flag:'wx',mode:0o600});
}
if(!fs.existsSync(storeFile))execFileSync(path.join(java,'bin',process.platform==='win32'?'keytool.exe':'keytool'),['-genkeypair','-alias','tripwonder','-keyalg','RSA','-keysize','3072','-validity','10000','-storetype','PKCS12','-keystore',storeFile,'-storepass:env','TRIPWONDER_KEY_PASSWORD','-keypass:env','TRIPWONDER_KEY_PASSWORD','-dname','CN=TripWonder Prototype','-noprompt'],{env:{...process.env,TRIPWONDER_KEY_PASSWORD:secrets.password},stdio:'pipe'});
fs.writeFileSync(path.resolve(__dirname,'../android/signing.properties'),`storeFile=${storeFile.replace(/\\/g,'/')}
storePassword=${secrets.password}
keyAlias=tripwonder
keyPassword=${secrets.password}
`,{mode:0o600});
console.log(`Release signing configured. Back up the private signing directory: ${home}`);
