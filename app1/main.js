// (setq js-indent-level 1)  # for Emacs

function makelink(indexobj,txt) {
 let href = window.location.href;
 //let url = new URL(href);
 //let search = url.search  // a string, possibly empty
 let base = href.replace(/[?].*$/,'');
 let kand = indexobj.kand;
 let sarga = indexobj.sarga;
 let sargap = indexobj.sargap;
 let v2 = indexobj.v2;
 let newsearch = `?${kand},${sarga},${sargap},${v2}`;
 let newhref = base + newsearch;
 let html = `<a class="nppage" href="${newhref}"><span class="nppage">${txt}</span></a>`;
 return html;
}
function display_ipage_id(indexes) {
 //console.log('display_ipage_id: indexes=',indexes);
 [indexprev,indexcur,indexnext] = indexes;
 let prevlink = makelink(indexprev,'<');
 let nextlink = makelink(indexnext,'>');

 let ipage = indexcur['ipage']; //
 let vp = indexcur['vp'];
 let v = vp.substring(0,1); // volume
 let html = `<p>${prevlink} <span class="nppage">Page ${v}-${ipage}</span> ${nextlink}</p>`;
 let elt = document.getElementById('ipageid');
 elt.innerHTML = html;
}

function get_pdfpage_from_index(indexobj) {
/* indexobj assumed an element of indexdata
 return name of file with the given page
 
*/
 let vp = indexobj['vp'];
 if (vp == "1000") { // for default 
  vp = "1006";
 }
 let v = vp.substring(0,1); // n
 let p = vp.substring(1,4); // nnn
 let rv = 'I';  // v converted to roman
 if (v == '1') {
  rv = 'I';
 }else if (v == '2') {
  rv = 'II';
 }else if (v == '3') {
  rv = 'III';
 }
 let pdfdir = ``;
 let pdf = `../pdfpagesv${v}/ram-${rv}-${p}.pdf`;
 //console.log(indexobj);
 //console.log(pdf);
 return pdf;
}

function get_ipage_html(indexcur) {
 let html = null;
 if (indexcur == null) {return html;}
 let pdfcur = get_pdfpage_from_index(indexcur);
 //console.log('pdfcur=',pdfcur);
 let urlcur = pdfcur; // `../pdfpages/${pdfcur}`;
 let android = ` <a href='${urlcur}' style='position:relative; left:100px;'>Click to load pdf</a>`;
 let imageElt = `<object id='servepdf' type='application/pdf' data='${urlcur}' 
              style='width: 98%; height:98%'> ${android} </object>`;
 //console.log('get_ipage_html. imageElt=',imageElt);
 return imageElt;
}

function display_ipage_html(indexes) {
 display_ipage_id(indexes);
 let html = get_ipage_html(indexes[1]);
 let elt=document.getElementById('ipage');
 elt.innerHTML = html;
}

function get_indexobjs_from_verse(verse) {
 // uses indexdata from index.js
 // verse is a 4-tuple of ints
 let icur = -1;
 for (let i=0; i < indexdata.length; i++ ) {
  let obj = indexdata[i];
  if (obj.kand != verse[0]) {continue;}
  if (obj.sarga != verse[1]) {continue;}
  if (obj.sargap != verse[2]) {continue;}
  if ((obj.v1 <= verse[3]) && (verse[3] <= obj.v2)) {
   icur = i;
   break;
  }
 }
 //console.log(verse,icur);
 let ans, prevobj, curobj, nextobj
 if (icur == -1) {
  // default
  prevobj = indexdata[2];
  curobj = indexdata[3];
  nextobj = indexdata[4];
  //ans  = [indexdata[],indexdata[1],indexdata[2]];
 } else {
  curobj = indexdata[icur];
  if (icur <= 2) {
   prevobj = curobj;
  } else {
   prevobj = indexdata[icur - 1];
  }
  let inext = icur + 1;
  if (inext < indexdata.length) {
   nextobj = indexdata[inext];
  }else {
   nextobj = curobj;
  }
 }
 ans = [prevobj,curobj,nextobj];
 return ans;
}

function get_verse_from_url() {
 /* return 4-tuple of int numbers derived from url search string.
    Returns [0,0,0,0] as default
   kand,sarga,sargap,verse
*/
 let href = window.location.href;
 let url = new URL(href);
 // url = http://xyz.com?X ,
 // search = ?X
 let search = url.search;  // a string, possibly empty
 let defaultval = [0,0,0,0]; // default value
 let nparm = 4;
 let iverse = [];
 let x = search.match(/^[?]([0-9]+),([0-9]+),([0-9]+),([0-9]+)$/);
 if (x != null) {
  // convert to ints kanda, sarga, sargap, verse
  for(let i=0;i<nparm;i++) {
   iverse.push(parseInt(x[i+1]));
  }
 }else {
  // try 3 -parameters
  x = search.match(/^[?]([0-9]+),([0-9]+),([0-9]+)$/);
  if (x == null) {
   return defaultval;
  }
  // convert to ints
  iverse.push(parseInt(x[0+1])) //kanda
  iverse.push(parseInt(x[1+1])) //sarga
  iverse.push(0) // sargap is 0 for non-prakshipta
  iverse.push(parseInt(x[2+1])) //verse
 }
 return iverse;
}

function display_ipage_url() {
 let url_verse = get_verse_from_url();
 //console.log('url_verse=',url_verse);
 let indexobjs = get_indexobjs_from_verse(url_verse);
 //console.log('indexobjs=',indexobjs);
 display_ipage_html(indexobjs);
}

document.getElementsByTagName("BODY")[0].onload = display_ipage_url;

