const fs = require("fs");
const axios = require("axios");
const { JSDOM } = require("jsdom");

//Functions to decipher locked textbooks
function parsHexToNormalString(b){let c;for(c="";2<=b.length;)c+=String.fromCharCode(parseInt(b.substring(0,2),16)),b=b.substring(2,b.length);return c}
function rc4(b, c){
  for(var d=[],f=[],g=0;256>g;g++)d[g]=g,f[g]=b.charCodeAt(g%b.length);
  for(var h=0,g=0;256>g;g++){
      var h=h+d[g]+f[g]&255,k=d[g];d[g]=d[h];d[h]=k
  }
  for(var l=h=f=0,m,k="",g=0;g<c.length;g++)f=f+1&255,h=h+d[f]&255,l=d[f],d[f]=d[h],d[h]=l,l=d[f]+d[h]&255,m=c.charCodeAt(g),m^=d[l],k+=String.fromCharCode(m);
  return k
}
function decode(b){
  b=String(b);for(var c=b.length,d=0,f,g,h="",k=-1;++k<c;)g="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".indexOf(b.charAt(k)),
  f=d%4?64*f+g:g,d++%4&&(h+=String.fromCharCode(255&f>>(-2*d&6)));return h
}
function encode(b){
  b=String(b);if(/[^\0-\xFF]/.test(b))throw new g("The string to be encoded contains characters outside of the Latin1 range.");for(var c=b.length%3,d="",f=-1,h,k,s,r=b.length-c;++f<r;)h=b.charCodeAt(f)<<16,
  k=b.charCodeAt(++f)<<8,s=b.charCodeAt(++f),h=h+k+s,d+="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".charAt(h>>18&63)+"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"
  .charAt(h>>12&63)+"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".charAt(h>>6&63)+"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".charAt(h&63);2==c?(h=b.charCodeAt(f)<<8,
  k=b.charCodeAt(++f),h+=k,d+="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".charAt(h>>10)+"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".charAt(h>>4&63)+"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"
  .charAt(h<<2&63)+"="):1==c&&(h=b.charCodeAt(f),d+="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".charAt(h>>2)+"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".charAt(h<<4&63)+"==");return d
}

(async () => {
  let textbook_password = "dze23" //Password provided by 董總
  const sourceRaw = await axios
    .get("https://elearning.dongzong.my/course/index.php?categoryid=5", {
      withCredentials: true,
      headers: {
        Cookie:
          "MoodleSession=fl22cv9i65s2bqcasn3dgv2jdp; MOODLEID1_=S%25B5%25CC%25C2%2584%25D5%2583",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    })
    .then((e) => e.data);
  const sourceDom = new JSDOM(sourceRaw);
  const sourceLinks = Array.from(
    sourceDom.window.document.querySelectorAll(".coursebox a")
  )
    .map((e) => e.getAttribute("href"))
    .filter((e) => e.includes("view"));

  for (let link of sourceLinks) {
    const ID = link.split("=").pop();

    const raw = await axios
      .get(`https://elearning.dongzong.my/course/view.php?id=${ID}`, {
        withCredentials: true,
        headers: {
          Cookie:
            "MoodleSession=fl22cv9i65s2bqcasn3dgv2jdp; MOODLEID1_=S%25B5%25CC%25C2%2584%25D5%2583",
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        },
      })
      .then((e) => e.data);

    const dom = new JSDOM(raw);
    const links = Array.from(
      dom.window.document.querySelectorAll(".activityinstance a")
    )
      .map((e) => e.getAttribute("href"))
      .filter((e) => e.includes("book"));
    for (url of links) {
      const raw2 = await axios(url, {
        withCredentials: true,
        headers: {
          Cookie:
            "MoodleSession=fl22cv9i65s2bqcasn3dgv2jdp; MOODLEID1_=S%25B5%25CC%25C2%2584%25D5%2583",
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        },
      }).then((e) => e.data);
      const dom2 = new JSDOM(raw2);
      const links2 = dom2.window.document
        .querySelector("[role='main'] h4 a")
        ?.getAttribute("href");
      if (links2) {
        let [, , , category, grade, subject, subsubject, chapter] = links2
          .split("/")
          .map((e) => e.trim());
        if (chapter.endsWith(".html")) {
          chapter = chapter.split(".")[0];
          subsubject = "";
        } else {
          if (chapter === "mobile") {
            chapter = subsubject;
            subsubject = "";
          }
        }
        console.log(category, grade, subject, subsubject, chapter);

        let page = 1;
        let locked = false
        let url = `https://elearning.dongzong.my/dongzong/${category}/${grade}/${subject}/${subsubject}/${chapter}/files/mobile/${page}.jpg`;
        let config_url = `https://elearning.dongzong.my/dongzong/${category}/${grade}/${subject}/${subsubject}/${chapter}/mobile/javascript/config.js`;
        let singleRealKey;
        await axios.get(url).then().catch(async() => {
          locked = true
          await axios.get(config_url).then(async (config_res) => {
            const regex = /bookConfig\.singlePasswordKey[^"]*"([^"]*)"/
            const match = regex.exec(config_res.data);
            let singlePasswordKey;
            if (match) {
                singlePasswordKey = match[1]
            }
            singleRealKey = rc4("dze23", parsHexToNormalString(singlePasswordKey))
          }).catch(err => console.log(err))
        })

        while (true) {
          let data;

          if(!locked) {
            url = `https://elearning.dongzong.my/dongzong/${category}/${grade}/${subject}/${subsubject}/${chapter}/files/mobile/${page}.jpg`

            try {
              const res = await axios(url, {
                responseType: "stream",
              });
              data = res.data;
              fs.mkdirSync(`./${grade}/${subject}/${subsubject}/${chapter}`, {
                recursive: true,
              });
              const w = data.pipe(
                fs.createWriteStream(
                  `./${grade}/${subject}/${subsubject}/${chapter}/page${String(
                    page
                  ).padStart(2, "0")}.jpg`
                )
              );
              let page_wip = page
              w.on("finish", () => {
                console.log(`${chapter}/${page_wip}`);
              });
              page++;
            } catch (err) {
              page = 1;
              break;
            }
          } else {
            url = `https://elearning.dongzong.my/dongzong/${category}/${grade}/${subject}/${subsubject}/${chapter}/files/mobile/${page}.js`;
  
            try {
              await axios.get(url).then((res) => {
                const page_regex = /=[^"]*"([^"]*)"/
                const ciphered = page_regex.exec(res.data)
                if (ciphered) {
                  let page_var_dc = decode(ciphered[1])
                  data = encode(rc4(singleRealKey, page_var_dc))
                  //data = atob(encode(rr))
                }
              })
            } catch (err) {
              page = 1;
              break;
            }
  
            fs.mkdirSync(`./${grade}/${subject}/${subsubject}/${chapter}`, {
              recursive: true,
            });
            fs.writeFileSync( `./${grade}/${subject}/${subsubject}/${chapter}/page${String(page).padStart(2, "0")}.jpg`, data, {encoding: "base64"})
            console.log(`${chapter}/${page}`);
            page++;
          }
        }
      }
    }
  }
})();