let t=(t,i)=>(l,c)=>s(l)?(i=n(i),(s,n,e)=>{let p=i();return r(e,s,t,o(p)?[p]:[]),l(s,p)?s:a(c,n,e)}):e(t),o=t=>void 0!==t,s=((global||window).isFinite,t=>"function"==typeof t),n=t=>s(t)?t:()=>t,r=(t,o,s,n=[])=>(t&&(t.validator=s,t.params=n,t._logs.push([s,o,n])),t),a=(t,o,s)=>(o&&o(t,s),null),e=t=>{throw`Invalid params provided in '${t}'`};export let V_MAIL="email";export let V_URL="url";let i=/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;export let email=o=>t(V_MAIL)(t=>i.test(t),o);let l=/^\S+@\S+\.\S+$/;export let fastEmail=o=>t(V_MAIL)(t=>l.test(t),o);let c=/^https?:\/\/[^\s$.?#].[^\s]*$/;export let url=o=>t("url")(t=>c.test(t),o);