(function () {
  "use strict";

  var DRAFT_KEY = "folioready-draft-v1";
  var MAX_FILE_BYTES = 5 * 1024 * 1024;
  var state = {
    step: 1,
    type: "professional",
    theme: "tech",
    color: "#1677ff",
    radius: 16,
    fullName: "",
    role: "",
    location: "",
    email: "",
    phone: "",
    bio: "",
    linkedin: "",
    website: "",
    photoData: "",
    photoName: "",
    resumeName: "",
    skills: [],
    projects: [],
    services: [],
    experience: [],
    education: [],
    certifications: [],
    sections: { about: true, contact: true, skills: true, projects: true, services: true, experience: true, education: true, certifications: true }
  };

  function $(selector, root) { return (root || document).querySelector(selector); }
  function $$(selector, root) { return Array.prototype.slice.call((root || document).querySelectorAll(selector)); }
  function escapeHtml(value) {
    return String(value || "").replace(/[&<>"']/g, function (character) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[character];
    });
  }
  function validUrl(value) {
    if (!value) return true;
    try {
      var parsed = new URL(value);
      return parsed.protocol === "http:" || parsed.protocol === "https:";
    } catch (error) { return false; }
  }
  function safeUrl(value) { return validUrl(value) ? escapeHtml(value) : "#"; }
  function safeImage(value) {
    return /^data:image\/(?:jpeg|png|webp);base64,[a-z0-9+/=]+$/i.test(String(value || "")) ? value : "";
  }
  function initials(name) {
    var parts = String(name || "Your Name").trim().split(/\s+/).slice(0, 2);
    return parts.map(function (part) { return part.charAt(0).toUpperCase(); }).join("") || "YN";
  }
  function readableText(hex) {
    var clean = String(hex).replace("#", "");
    var r = parseInt(clean.slice(0, 2), 16);
    var g = parseInt(clean.slice(2, 4), 16);
    var b = parseInt(clean.slice(4, 6), 16);
    return ((r * 299 + g * 587 + b * 114) / 1000) > 150 ? "#071a38" : "#ffffff";
  }

  function portfolioDocument(data, showIntro) {
    var name = escapeHtml(data.fullName || "Your Name");
    var role = escapeHtml(data.role || "Your professional title");
    var bio = escapeHtml(data.bio || "Your professional summary will appear here as you complete the builder.");
    var location = escapeHtml(data.location || "");
    var accent = /^#[0-9a-f]{6}$/i.test(data.color) ? data.color : "#1677ff";
    var radius = Math.max(4, Math.min(28, Number(data.radius) || 16));
    var skillMarkup = data.skills.length
      ? data.skills.map(function (skill) { return "<span>" + escapeHtml(skill) + "</span>"; }).join("")
      : "<p class=\"empty\">Your skills will appear here.</p>";
    var projectMarkup = data.projects.length
      ? data.projects.map(function (project) {
          var link = validUrl(project.url) ? "<a href=\"" + safeUrl(project.url) + "\" target=\"_blank\" rel=\"noopener\">View project →</a>" : "";
          return "<article><small>FEATURED PROJECT</small><h3>" + escapeHtml(project.title || "Untitled project") + "</h3><p>" + escapeHtml(project.description || "Add a short description of your work.") + "</p>" + link + "</article>";
        }).join("")
      : "<p class=\"empty\">Your selected projects will appear here.</p>";
    var serviceMarkup = (data.services || []).length
      ? data.services.map(function (service, index) { return "<article><b>0" + (index + 1) + "</b><h3>" + escapeHtml(service) + "</h3><p>Focused support shaped around your goals and audience.</p></article>"; }).join("")
      : "<p class=\"empty\">Add services to show how you can help.</p>";
    var experienceMarkup = (data.experience || []).length
      ? data.experience.map(function (item, index) { return "<article><span>" + (index + 1) + "</span><div><small>" + escapeHtml(item.period) + "</small><h3>" + escapeHtml(item.role || "Role") + "</h3><b>" + escapeHtml(item.organization || "Organisation") + "</b><p>" + escapeHtml(item.description || "") + "</p></div></article>"; }).join("")
      : "<p class=\"empty\">Add roles, internships or freelance work to build your timeline.</p>";
    var educationMarkup = (data.education || []).length
      ? data.education.map(function (item) { return "<article><small>" + escapeHtml(item.period) + "</small><h3>" + escapeHtml(item.degree || "Qualification") + "</h3><b>" + escapeHtml(item.school || "Institution") + "</b><p>" + escapeHtml(item.description || "") + "</p></article>"; }).join("")
      : "<p class=\"empty\">Add your education to complete this section.</p>";
    var certificationMarkup = (data.certifications || []).length
      ? data.certifications.map(function (item) { var certificateLink = validUrl(item.url) ? "<a href=\"" + safeUrl(item.url) + "\" target=\"_blank\" rel=\"noopener\">View credential →</a>" : ""; return "<article><small>" + escapeHtml(item.year) + "</small><h3>" + escapeHtml(item.name || "Certification") + "</h3><p>" + escapeHtml(item.issuer || "Issuing organisation") + "</p>" + certificateLink + "</article>"; }).join("")
      : "<p class=\"empty\">Add certifications or continued-learning achievements.</p>";
    var contactLinks = [];
    if (data.email) contactLinks.push("<a href=\"mailto:" + escapeHtml(data.email) + "\">Email</a>");
    if (data.phone) contactLinks.push("<a href=\"tel:" + escapeHtml(data.phone) + "\">Phone</a>");
    if (validUrl(data.linkedin)) contactLinks.push("<a href=\"" + safeUrl(data.linkedin) + "\" target=\"_blank\" rel=\"noopener\">LinkedIn</a>");
    if (validUrl(data.website)) contactLinks.push("<a href=\"" + safeUrl(data.website) + "\" target=\"_blank\" rel=\"noopener\">Website</a>");
    var firstEducation = (data.education || [])[0] || {};
    var focusText = (data.services || [])[0] || data.role || "Meaningful digital products";
    var focusSkills = (data.skills || []).slice(0, 3).join(" · ") || "Skills · Projects · Results";
    var heroLinks = "<a class=\"hero-button primary\" href=\"#projects\">Explore my work →</a>";
    if (data.email) heroLinks += "<a class=\"hero-button secondary\" href=\"mailto:" + escapeHtml(data.email) + "\">Contact me</a>";
    var profilePanel = "<div class=\"profile-panel\"><div class=\"profile-accent\"></div><div class=\"avatar\">" + (safeImage(data.photoData) ? "<img src=\"" + data.photoData + "\" alt=\"Portrait of " + name + "\">" : initials(data.fullName)) + "</div><h3>" + name + "</h3><b>" + role + "</b>" + (location ? "<span class=\"profile-location\">⌖ " + location + "</span>" : "") + "<div class=\"profile-focus\"><small>CORE FOCUS</small><strong>" + escapeHtml(focusText) + "</strong><p>" + escapeHtml(focusSkills) + "</p></div></div>";
    var sections = "";
    if (data.sections.about) sections += "<section id=\"about\" class=\"about-section\"><div class=\"section-heading\"><p class=\"label\">GET TO KNOW ME</p><h2>Developer, problem solver,<br>product thinker.</h2><p class=\"lead\">" + bio + "</p></div><div class=\"value-grid\"><article><b>⌂</b><h3>Strong Foundation</h3><p>" + escapeHtml(firstEducation.degree || "Add your education and academic foundation.") + "</p><small>" + escapeHtml(firstEducation.school || "Education · Learning · Growth") + "</small></article><article><b>&lt;/&gt;</b><h3>Practical Skills</h3><p>" + escapeHtml((data.skills || []).slice(0, 5).join(", ") || "Add the tools and strengths that shape your work.") + "</p><small>Skills · Tools · Problem solving</small></article><article><b>✦</b><h3>Career Direction</h3><p>" + escapeHtml((data.services || []).slice(0, 3).join(", ") || "Add services or areas where you want to contribute.") + "</p><small>Purpose · Impact · Collaboration</small></article></div></section>";
    if (data.sections.services) sections += "<section id=\"services\"><p class=\"label\">WHAT I DO</p><h2>Ways I can contribute.</h2><div class=\"services\">" + serviceMarkup + "</div></section>";
    sections += "<section class=\"stats\"><div><strong>" + (data.projects || []).length + "<i>+</i></strong><span>Projects</span></div><div><strong>" + (data.skills || []).length + "<i>+</i></strong><span>Skills</span></div><div><strong>" + (data.experience || []).length + "</strong><span>Experience entries</span></div><div><strong>" + (data.certifications || []).length + "</strong><span>Certifications</span></div></section>";
    if (data.sections.skills) sections += "<section id=\"skills\"><p class=\"label\">CAPABILITIES</p><h2>Skills I bring to the work.</h2><div class=\"skills\">" + skillMarkup + "</div></section>";
    if (data.sections.experience) sections += "<section id=\"experience\"><p class=\"label\">EXPERIENCE & JOURNEY</p><h2>Work that shaped my craft.</h2><div class=\"timeline\">" + experienceMarkup + "</div></section>";
    if (data.sections.projects) sections += "<section id=\"projects\"><p class=\"label\">SELECTED WORK</p><h2>Projects with purpose.</h2><div class=\"projects\">" + projectMarkup + "</div></section>";
    if (data.sections.education) sections += "<section id=\"education\"><p class=\"label\">ACADEMIC FOUNDATION</p><h2>Education.</h2><div class=\"record-grid\">" + educationMarkup + "</div></section>";
    if (data.sections.certifications) sections += "<section id=\"certifications\"><p class=\"label\">CONTINUED LEARNING</p><h2>Certifications.</h2><div class=\"record-grid\">" + certificationMarkup + "</div></section>";
    if (data.sections.contact) sections += "<section id=\"contact\" class=\"contact\"><p class=\"label\">GET IN TOUCH</p><h2>Let’s work together.</h2><p>Have an opportunity, project idea or collaboration in mind? Start a conversation.</p><div class=\"contact-grid\"><div><h3>Let’s start a conversation.</h3><div class=\"links\">" + (contactLinks.join("") || "<span>Add contact details to create your links.</span>") + "</div></div><form id=\"portfolio-contact-form\"><div><label>Name<input name=\"name\" required placeholder=\"Your name\"></label><label>Email<input name=\"email\" type=\"email\" required placeholder=\"you@example.com\"></label></div><label>Subject<input name=\"subject\" required placeholder=\"What would you like to discuss?\"></label><label>Message<textarea name=\"message\" required rows=\"5\" placeholder=\"Tell me about the opportunity or project.\"></textarea></label><button type=\"submit\">Send message →</button><small>This opens your email application; messages are not stored by this site.</small></form></div></section>";

    var themeRules = "";
    if (data.theme === "bold") themeRules = "body{background:#071a38;color:#fff}.hero{min-height:74vh}.hero h1{font-size:clamp(54px,10vw,120px);max-width:1000px}.muted,.lead,section>p,.empty{color:#aebbd0!important}section{border-color:#29405f}.project-grid article,.projects article{background:#0d2852;border-color:#29405f}.top{border-color:#29405f}.top a{color:#fff}";
    if (data.theme === "editorial") themeRules = "body{color:#322a25;background:#fbf7ef}.top{background:#fbf7efe8;border-color:#e4dacb}h1,h2,h3{font-family:Georgia,serif;font-weight:500}.hero{background:radial-gradient(circle at 90% 20%,#b8733320,transparent 32%)}section{border-color:#e4dacb}.projects article,.services article,.record-grid article,.timeline article{border-color:#e4dacb;background:#fffdf8}.contact{background:#302923}";
    if (data.theme === "spotlight") themeRules = "body{background:linear-gradient(180deg,#fff9fc,#fff 38%,#faf7ff);color:#30212a}.top{position:sticky;top:0;z-index:5;background:#fffafccc;backdrop-filter:blur(16px);border-color:#f0d8e2}.mark b,.label,.projects article small,.projects article a{color:#ee4d87!important}.hero{min-height:720px;background:radial-gradient(circle at 14% 18%,#ff5d9a22,transparent 28%),radial-gradient(circle at 88% 30%,#a66ee82b,transparent 32%),linear-gradient(135deg,#fff7fa,#fbf7ff)}.hero h1{background:linear-gradient(90deg,#f04f8b,#a66ee8);background-clip:text;-webkit-background-clip:text;color:transparent}.avatar{width:210px;height:250px;border-radius:32px;background:linear-gradient(145deg,#f04f8b,#a66ee8);box-shadow:24px 24px 0 #f04f8b18}.role{color:#412c38}.lead,.muted,section>p,.empty{color:#806d77}.skills span{border-color:#efb6cb;background:#fff2f7;color:#71334c}.projects article{border-color:#efd9e2;background:#fffdfebf;box-shadow:0 18px 45px #6d355018;backdrop-filter:blur(12px)}section{border-color:#f1dee6}.contact{background:linear-gradient(135deg,#342536,#241a35)}";
    if (data.theme === "tech") themeRules = "body{color:#eef5ff;background:#061224;background-image:radial-gradient(circle at 7% 24%,#19d9ef17,transparent 26%),radial-gradient(circle at 91% 18%,#7657e821,transparent 30%),linear-gradient(#52e7ff08 1px,transparent 1px),linear-gradient(90deg,#52e7ff08 1px,transparent 1px);background-size:auto,auto,64px 64px,64px 64px}.top{position:sticky;top:0;z-index:8;border-color:#203452;background:#081629e8;backdrop-filter:blur(16px)}.top a{color:#9eacc2}.mark{color:#fff}.mark b,.label,.projects article small,.projects article a{color:#52e7ff!important}.hero{min-height:720px;background:radial-gradient(circle at 20% 40%,#16dff019,transparent 33%),radial-gradient(circle at 88% 50%,#7657e82b,transparent 35%)}.hero h1{max-width:850px;background:linear-gradient(90deg,#f4f8ff,#55e8ff 42%,#7f7cff 72%,#ff91ad);background-clip:text;-webkit-background-clip:text;color:transparent}.role{color:#f6f8ff}.avatar{width:220px;height:220px;border:5px solid #52e7ff;border-radius:50%;color:#fff;background:linear-gradient(145deg,#13243e,#20375b);box-shadow:0 0 0 6px #7657e8,0 0 55px #52e7ff48}.lead,.muted,section>p,.empty{color:#9aaac1}.skills span{border-color:#29425f;color:#dce8f8;background:#101f35}.projects article{border-color:#243856;background:#0d1b31;box-shadow:0 18px 45px #0005}.projects article:hover{border-color:#52e7ff;transform:translateY(-4px)}section{border-color:#182b47}.contact{background:#050e1d}.links a,.links span{border-color:#52e7ff66}.boot{position:fixed;inset:0;z-index:99;display:grid;place-items:center;color:#dce8f8;background:#030b19;animation:boot-away 2.8s ease forwards}.boot-box{width:min(560px,calc(100% - 36px));padding:25px;border:1px solid #28506d;border-radius:18px;background:#0a1830;box-shadow:0 0 60px #52e7ff1f}.boot-logo{text-align:center;font-size:30px;font-weight:800}.boot-logo b{color:#52e7ff}.boot-box>small{display:block;margin:8px 0 24px;text-align:center;color:#75dff0;letter-spacing:.16em}.boot-line{display:flex;margin:10px 0;justify-content:space-between;color:#a9b8ca;font-family:monospace}.boot-line i{color:#62efbd;font-style:normal}@keyframes boot-away{0%,76%{opacity:1;visibility:visible}100%{opacity:0;visibility:hidden;pointer-events:none}}";
    if (data.theme === "tech") themeRules += ".projects article,.services article,.record-grid article,.timeline article{border-color:#243856;background:#0d1b31;box-shadow:0 18px 45px #0005}.services article p,.record-grid article p,.timeline p,.stats span{color:#9aaac1}.stats{background:#08162a}";
    var introMarkup = "";
    if (showIntro && data.theme === "tech") introMarkup = "<div class=\"boot\" id=\"portfolio-boot\" role=\"dialog\" aria-label=\"Portfolio loading screen\"><div class=\"boot-box\"><div class=\"boot-logo\">PORTFOLIO<b>/DEV</b></div><small>INITIALIZING CREATIVE WORKSPACE</small><div class=\"boot-line\"><span>✓ Loading portfolio modules...</span><i>READY</i></div><div class=\"boot-line\"><span>✓ Connecting project data...</span><i>READY</i></div><div class=\"boot-line\"><span>✓ Preparing workspace...</span><i>READY</i></div><button id=\"skip-boot\" type=\"button\">SKIP INTRO</button></div></div>";
    if (showIntro && data.theme === "spotlight") introMarkup = "<div class=\"boot spotlight-boot\" id=\"portfolio-boot\" role=\"dialog\" aria-label=\"Portfolio loading screen\"><div class=\"boot-box\"><div class=\"boot-logo\">PORTFOLIO<b>/READY</b></div><small>PREPARING YOUR STORY</small><div class=\"boot-line\"><span>✓ Arranging selected work...</span><i>READY</i></div><div class=\"boot-line\"><span>✓ Applying visual style...</span><i>READY</i></div><div class=\"boot-line\"><span>✓ Opening portfolio...</span><i>READY</i></div><button id=\"skip-boot\" type=\"button\">SKIP INTRO</button></div></div>";
    var motionMarkup = "<div class=\"ambient\" aria-hidden=\"true\"><i></i><i></i><i></i><i></i><i></i><i></i></div><div class=\"cursor-glow\" id=\"cursor-glow\" aria-hidden=\"true\"></div>";
    var motionRules = ".boot #skip-boot{display:block;margin:22px auto 0;padding:8px 13px;border:1px solid #ffffff35;border-radius:8px;color:inherit;background:transparent;cursor:pointer;font-size:10px;letter-spacing:.14em}.spotlight-boot{color:#392430;background:#fff7fb}.spotlight-boot .boot-box{border-color:#f0d3df;background:#fff;box-shadow:0 25px 70px #7d385226}.spotlight-boot .boot-logo b,.spotlight-boot .boot-box>small{color:#e94c86}.spotlight-boot .boot-line{color:#806d77}.spotlight-boot .boot-line i{color:#087f5b}.spotlight-boot #skip-boot{border-color:#ebcbd7}.boot.dismissed{opacity:0!important;visibility:hidden!important;pointer-events:none!important}.ambient{position:fixed;inset:0;z-index:-1;overflow:hidden;pointer-events:none}.ambient i{position:absolute;width:4px;height:4px;border-radius:50%;background:#52e7ff;box-shadow:0 0 14px #52e7ff;animation:float-dot 9s ease-in-out infinite}.ambient i:nth-child(1){left:8%;top:18%}.ambient i:nth-child(2){left:31%;top:72%;animation-delay:-2s}.ambient i:nth-child(3){left:56%;top:12%;animation-delay:-5s}.ambient i:nth-child(4){left:78%;top:63%;animation-delay:-3s}.ambient i:nth-child(5){left:91%;top:31%;animation-delay:-7s}.ambient i:nth-child(6){left:18%;top:88%;animation-delay:-4s}.cursor-glow{position:fixed;z-index:80;width:24px;height:24px;border:1px solid " + accent + ";border-radius:50%;pointer-events:none;transform:translate(-50%,-50%);opacity:0;box-shadow:0 0 30px " + accent + "55;transition:width .18s,height .18s,opacity .2s}.cursor-glow.active{width:42px;height:42px}.reveal-node{opacity:0;transform:translateY(28px);transition:opacity .7s ease,transform .7s cubic-bezier(.2,.75,.25,1);transition-delay:var(--reveal-delay,0ms)}.reveal-node.visible{opacity:1;transform:none}.projects article,.services article,.record-grid article,.timeline article,.skills span{transition:transform .25s ease,border-color .25s ease,box-shadow .25s ease}.projects article:hover,.services article:hover,.record-grid article:hover{transform:translateY(-6px);box-shadow:0 20px 45px #06122425}.top nav a.active{color:" + accent + "}.hero h1{background-size:200% auto;animation:title-shift 7s linear infinite}@keyframes title-shift{to{background-position:200% center}}@keyframes float-dot{0%,100%{transform:translateY(0);opacity:.25}50%{transform:translateY(-26px);opacity:.85}}@media(pointer:coarse){.cursor-glow{display:none}}@media(prefers-reduced-motion:reduce){.boot{display:none!important}.ambient i,.hero h1{animation:none!important}.reveal-node{opacity:1;transform:none;transition:none}}";
    var motionScript = "<script>(function(){var glow=document.getElementById('cursor-glow');if(glow&&matchMedia('(pointer:fine)').matches){document.addEventListener('mousemove',function(e){glow.style.left=e.clientX+'px';glow.style.top=e.clientY+'px';glow.style.opacity='1'});document.querySelectorAll('a,button,article').forEach(function(el){el.addEventListener('mouseenter',function(){glow.classList.add('active')});el.addEventListener('mouseleave',function(){glow.classList.remove('active')})})}var nodes=document.querySelectorAll('section>*,.projects article,.services article,.timeline article,.record-grid article');nodes.forEach(function(el,i){el.classList.add('reveal-node');el.style.setProperty('--reveal-delay',(i%4)*70+'ms')});if('IntersectionObserver'in window){var observer=new IntersectionObserver(function(entries){entries.forEach(function(entry){if(entry.isIntersecting){entry.target.classList.add('visible');observer.unobserve(entry.target)}})},{threshold:.12});nodes.forEach(function(el){observer.observe(el)})}else{nodes.forEach(function(el){el.classList.add('visible')})}var links=document.querySelectorAll('.top nav a');var sections=document.querySelectorAll('main section[id]');if('IntersectionObserver'in window){var navObserver=new IntersectionObserver(function(entries){entries.forEach(function(entry){if(entry.isIntersecting){links.forEach(function(link){link.classList.toggle('active',link.getAttribute('href')==='#'+entry.target.id)})}})},{rootMargin:'-35% 0px -55% 0px'});sections.forEach(function(section){navObserver.observe(section)})}var skip=document.getElementById('skip-boot');if(skip)skip.addEventListener('click',function(){document.getElementById('portfolio-boot').classList.add('dismissed')})})();<\/script>";
    var typeLabel = escapeHtml(String(data.type || "professional").toUpperCase() + " PORTFOLIO");

    motionRules = ".boot{position:fixed;inset:0;z-index:99;display:grid;place-items:center;color:#dce8f8;background:#030b19;animation:boot-away 2.8s ease forwards}.boot-box{width:min(560px,calc(100% - 36px));padding:25px;border:1px solid #28506d;border-radius:18px;background:#0a1830;box-shadow:0 0 60px #52e7ff1f}.boot-logo{text-align:center;font-size:30px;font-weight:800}.boot-logo b{color:#52e7ff}.boot-box>small{display:block;margin:8px 0 24px;text-align:center;color:#75dff0;letter-spacing:.16em}.boot-line{display:flex;margin:10px 0;justify-content:space-between;color:#a9b8ca;font-family:monospace}.boot-line i{color:#62efbd;font-style:normal}@keyframes boot-away{0%,76%{opacity:1;visibility:visible}100%{opacity:0;visibility:hidden;pointer-events:none}}" + motionRules;
    var structureRules = ".hero-grid{grid-template-columns:minmax(0,1fr) minmax(330px,520px);gap:70px}.hero-copy-block>.availability{display:inline-flex;margin-bottom:26px;padding:8px 14px;border:1px solid " + accent + "66;border-radius:99px;color:" + accent + ";font-size:12px;font-weight:700}.hero-copy-block>.availability:before{margin-right:8px;content:'●'}.hero-actions{display:flex;margin-top:28px;gap:12px;flex-wrap:wrap}.hero-button{display:inline-flex;padding:12px 18px;border:1px solid " + accent + ";border-radius:" + radius + "px;text-decoration:none;font-weight:800}.hero-button.primary{color:" + readableText(accent) + ";background:" + accent + "}.hero-button.secondary{background:transparent}.profile-panel{position:relative;padding:48px 30px 30px;text-align:center;border:1px solid " + accent + "66;border-radius:" + Math.max(18,radius) + "px;background:#0d1b31;box-shadow:0 24px 70px #0003}.profile-accent{position:absolute;top:0;left:14%;width:72%;height:4px;border-radius:4px;background:linear-gradient(90deg,#52e7ff,#7f7cff,#ff91ad)}.profile-panel .avatar{margin:0 auto 24px}.profile-panel h3{margin:0 0 5px;font-size:22px}.profile-panel>b{display:block;color:" + accent + "}.profile-location{display:inline-block;margin:22px 0;padding:8px 13px;border:1px solid #ffffff22;border-radius:99px;color:#aab8cc;font-size:13px}.profile-focus{margin-top:6px;padding:22px;border:1px solid #ffffff13;border-radius:" + radius + "px;background:#ffffff05}.profile-focus small,.profile-focus strong,.profile-focus p{display:block}.profile-focus small{color:#7f8da3;letter-spacing:.16em}.profile-focus strong{margin:9px 0;color:" + accent + ";font-size:18px}.profile-focus p{margin:0;color:#91a0b5;font-size:13px}.section-heading{text-align:center}.section-heading .lead{margin-right:auto;margin-left:auto}.value-grid{display:grid;margin-top:48px;grid-template-columns:repeat(3,1fr);gap:18px}.value-grid article{padding:28px;border:1px solid #e1e8f2;border-radius:" + radius + "px;background:#fbfdff}.value-grid article>b{display:grid;width:48px;height:48px;margin-bottom:24px;place-items:center;border-radius:14px;color:#fff;background:linear-gradient(135deg,#52e7ff,#7f7cff,#ff91ad)}.value-grid article p{color:#63708a}.value-grid article small{color:" + accent + ";font-weight:800}@media(max-width:900px){.hero-grid{grid-template-columns:1fr}.profile-panel{max-width:560px}.value-grid{grid-template-columns:1fr}}";
    themeRules += structureRules;
    if (data.theme === "tech" || data.theme === "bold") themeRules += ".value-grid article{border-color:#243856;background:#0d1b31}.value-grid article p{color:#9aaac1}";
    else themeRules += ".profile-panel{color:#10213e;border-color:" + accent + "55;background:#fff}.profile-location{color:#63708a;border-color:#dce5f2}.profile-focus{border-color:#e1e8f2;background:#f8faff}.profile-focus small,.profile-focus p{color:#63708a}";
    themeRules += ".contact-grid{display:grid;margin-top:36px;grid-template-columns:.75fr 1.25fr;gap:42px}.contact-grid .links{align-items:flex-start;flex-direction:column}.contact-grid form{padding:24px;border:1px solid " + accent + "77;border-radius:" + radius + "px;background:#0d1b31}.contact-grid form>div{display:grid;grid-template-columns:1fr 1fr;gap:12px}.contact-grid label{display:block;margin-bottom:12px;font-size:12px;font-weight:700}.contact-grid input,.contact-grid textarea{display:block;width:100%;margin-top:5px;padding:11px;border:1px solid #36506f;border-radius:8px;color:#fff;background:#111f35}.contact-grid button{width:100%;padding:12px;border:0;border-radius:8px;color:" + readableText(accent) + ";background:" + accent + ";font-weight:800;cursor:pointer}.contact-grid form>small{display:block;margin-top:9px;color:#8f9db1}@media(max-width:760px){.contact-grid{grid-template-columns:1fr}.contact-grid form>div{grid-template-columns:1fr}}";
    var contactScript = "<script>(function(){var form=document.getElementById('portfolio-contact-form');if(!form)return;form.addEventListener('submit',function(event){event.preventDefault();var data=new FormData(form);var to=" + JSON.stringify(data.email || "") + ";if(!to){alert('Add a portfolio email address before using this form.');return}var subject=encodeURIComponent(data.get('subject')||'Portfolio enquiry');var body=encodeURIComponent('From: '+(data.get('name')||'')+' <'+(data.get('email')||'')+'>\\n\\n'+(data.get('message')||''));window.location.href='mailto:'+to+'?subject='+subject+'&body='+body})})();<\/script>";
    return "<!doctype html><html lang=\"en\"><head><meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width,initial-scale=1\"><title>" + name + " — Portfolio</title><style>" +
      "*{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0;color:#10213e;background:#fff;font:16px/1.7 Arial,sans-serif}a{color:inherit}h1,h2,h3{margin-top:0;line-height:1.08;letter-spacing:-.04em}h1{font-size:clamp(48px,8vw,92px);margin-bottom:18px}h2{font-size:clamp(30px,4vw,48px)}.top{display:flex;padding:22px max(24px,7vw);align-items:center;justify-content:space-between;border-bottom:1px solid #e1e8f2}.mark{font-weight:800}.mark b{color:" + accent + "}.top nav{display:flex;gap:16px;flex-wrap:wrap}.top nav a{text-decoration:none;font-size:12px;font-weight:700}.hero{display:grid;min-height:620px;padding:90px max(24px,8vw);align-items:center;background:radial-gradient(circle at 90% 20%," + accent + "20,transparent 30%)}.hero-grid{display:grid;grid-template-columns:1fr auto;gap:50px;align-items:center}.label{color:" + accent + "!important;font-size:11px;font-weight:800;letter-spacing:.16em}.role{font-size:clamp(19px,3vw,28px);font-weight:700}.muted,.lead,section>p,.empty{color:#63708a}.avatar{display:grid;width:180px;height:180px;overflow:hidden;place-items:center;border-radius:" + radius + "px;color:" + readableText(accent) + ";background:" + accent + ";font-size:46px;font-weight:800;box-shadow:20px 20px 0 " + accent + "22}.avatar img{width:100%;height:100%;object-fit:cover}.location{margin-top:25px}section{padding:90px max(24px,8vw);border-top:1px solid #e1e8f2}.lead{max-width:820px;font-size:21px}.skills{display:flex;gap:10px;flex-wrap:wrap}.skills span{padding:9px 14px;border:1px solid " + accent + "55;border-radius:" + radius + "px;background:" + accent + "0f;font-weight:700}.services,.record-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:18px}.services article,.record-grid article{padding:25px;border:1px solid #e1e8f2;border-radius:" + radius + "px;background:#fbfdff}.services article>b{color:" + accent + "}.services article p,.record-grid article p{color:#63708a}.stats{display:grid;padding-top:42px;padding-bottom:42px;grid-template-columns:repeat(4,1fr);text-align:center}.stats strong,.stats span{display:block}.stats strong{font-size:38px}.stats strong i{color:" + accent + ";font-style:normal}.stats span{color:#63708a;font-size:13px}.timeline{position:relative;display:grid;gap:22px}.timeline article{display:grid;padding:28px;border:1px solid #e1e8f2;border-radius:" + radius + "px;grid-template-columns:44px 1fr;gap:18px;background:#fbfdff}.timeline article>span{display:grid;width:40px;height:40px;place-items:center;border-radius:50%;color:" + readableText(accent) + ";background:" + accent + ";font-weight:800}.timeline small,.record-grid small{color:" + accent + ";font-weight:800}.timeline h3,.record-grid h3{margin:7px 0}.timeline p{color:#63708a}.projects{display:grid;grid-template-columns:repeat(2,1fr);gap:18px}.projects article{padding:28px;border:1px solid #e1e8f2;border-radius:" + radius + "px;background:#fbfdff}.projects article small{color:" + accent + ";font-weight:800}.projects article h3{margin:12px 0;font-size:25px}.projects article a,.record-grid a{color:" + accent + ";font-weight:800}.contact{color:#fff;background:#071a38}.links{display:flex;gap:12px;flex-wrap:wrap}.links a,.links span{padding:10px 16px;border:1px solid #ffffff44;border-radius:" + radius + "px;text-decoration:none}.foot{padding:28px max(24px,8vw);color:#76839a;font-size:12px}.empty{padding:20px;border:1px dashed #aebbd0;border-radius:" + radius + "px}" +
      themeRules + motionRules + "@media(max-width:760px){.top nav{display:none}.hero{min-height:540px}.hero-grid{grid-template-columns:1fr}.avatar{width:115px;height:115px;grid-row:1}.projects,.services,.record-grid{grid-template-columns:1fr}.stats{grid-template-columns:repeat(2,1fr);gap:28px}section{padding-top:65px;padding-bottom:65px}}</style></head><body>" + introMarkup + motionMarkup +
      "<header class=\"top\"><div class=\"mark\">Portfolio<b>.</b></div><nav><a href=\"#about\">About</a><a href=\"#skills\">Skills</a><a href=\"#experience\">Experience</a><a href=\"#projects\">Projects</a><a href=\"#education\">Education</a><a href=\"#contact\">Contact</a></nav></header>" +
      "<main><div class=\"hero\"><div class=\"hero-grid\"><div class=\"hero-copy-block\"><span class=\"availability\">Open to roles and meaningful projects</span><p class=\"label\">HELLO, I'M · " + typeLabel + "</p><h1>" + name + "</h1><p class=\"role\">" + role + "</p><p class=\"lead\">" + bio + "</p><div class=\"hero-actions\">" + heroLinks + "</div></div>" + profilePanel + "</div></div>" + sections + "</main><footer class=\"foot\">Built with FolioReady · Your story. Your style. Your portfolio—ready.</footer>" + motionScript + contactScript + "</body></html>";
  }

  function updatePreview() {
    var frame = $("#preview-frame");
    var modalFrame = $("#modal-preview-frame");
    if (frame) frame.srcdoc = portfolioDocument(state, false);
    if (modalFrame) modalFrame.srcdoc = portfolioDocument(state, true);
  }

  function updateSelected(container, value) {
    $$(container + " [data-value]").forEach(function (element) {
      var selected = element.dataset.value === String(value);
      element.classList.toggle("selected", selected);
      if (element.hasAttribute("aria-checked")) element.setAttribute("aria-checked", String(selected));
      if (element.hasAttribute("aria-pressed")) element.setAttribute("aria-pressed", String(selected));
    });
  }

  function showBuilder() {
    $("#landing").hidden = true;
    $("#builder").hidden = false;
    window.scrollTo(0, 0);
    updatePreview();
  }

  function showLanding() {
    $("#builder").hidden = true;
    $("#landing").hidden = false;
    window.scrollTo(0, 0);
  }

  function showStep(number) {
    state.step = Math.max(1, Math.min(6, Number(number)));
    $$(".form-step").forEach(function (panel) {
      var active = Number(panel.dataset.panel) === state.step;
      panel.classList.toggle("active", active);
      panel.hidden = !active;
    });
    $$(".step").forEach(function (stepButton) {
      var stepNumber = Number(stepButton.dataset.step);
      stepButton.classList.toggle("active", stepNumber === state.step);
      stepButton.classList.toggle("complete", stepNumber < state.step);
      stepButton.setAttribute("aria-current", stepNumber === state.step ? "step" : "false");
    });
    var percent = Math.round(state.step / 6 * 100);
    $("#progress-percent").textContent = percent + "%";
    $("#progress-fill").style.width = percent + "%";
    $("#previous-step").style.visibility = state.step === 1 ? "hidden" : "visible";
    $("#next-step").hidden = state.step === 6;
    if (state.step === 6) updateReview();
    $(".builder-main").scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function setStatus(message, type) {
    var banner = $("#status-banner");
    banner.textContent = message;
    banner.className = "status-banner " + (type || "success");
    banner.hidden = false;
    window.setTimeout(function () { banner.hidden = true; }, 5000);
  }

  var toastTimer;
  function toast(message) {
    var element = $("#toast");
    window.clearTimeout(toastTimer);
    element.textContent = message;
    element.hidden = false;
    toastTimer = window.setTimeout(function () { element.hidden = true; }, 3000);
  }

  function setFieldError(id, message) {
    var field = $("#" + id);
    var error = $("#" + id + "-error");
    if (field) {
      field.classList.toggle("invalid", Boolean(message));
      field.setAttribute("aria-invalid", String(Boolean(message)));
    }
    if (error) error.textContent = message || "";
  }

  function readDetails() {
    ["fullName", "role", "location", "email", "phone", "bio", "linkedin", "website"].forEach(function (key) {
      var id = key.replace(/[A-Z]/g, function (letter) { return "-" + letter.toLowerCase(); });
      state[key] = $("#" + id).value.trim();
    });
    updatePreview();
  }

  function validateDetails(focusFirst) {
    readDetails();
    var errors = {};
    if (!state.fullName) errors["full-name"] = "Enter your full name.";
    if (!state.role) errors.role = "Enter your professional title.";
    if (!state.email) errors.email = "Enter your email address.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(state.email)) errors.email = "Enter a valid email address.";
    if (!state.bio) errors.bio = "Add a professional summary.";
    else if (state.bio.length < 30) errors.bio = "Write at least 30 characters.";
    if (state.linkedin && !validUrl(state.linkedin)) errors.linkedin = "Use a complete http:// or https:// URL.";
    if (state.website && !validUrl(state.website)) errors.website = "Use a complete http:// or https:// URL.";
    ["full-name", "role", "location", "email", "phone", "bio", "linkedin", "website"].forEach(function (id) { setFieldError(id, errors[id] || ""); });
    var keys = Object.keys(errors);
    if (focusFirst && keys.length) $("#" + keys[0]).focus();
    return keys.length === 0;
  }

  function validateWork(focusFirst) {
    var skillError = state.skills.length ? "" : "Add at least one skill.";
    var invalidProject = state.projects.some(function (project) { return !project.title.trim() || !project.description.trim() || (project.url && !validUrl(project.url)); });
    var projectError = invalidProject ? "Each project needs a title, description and a valid URL if supplied." : "";
    var invalidExperience = state.experience.some(function (item) { return !item.role.trim() || !item.organization.trim(); });
    var invalidEducation = state.education.some(function (item) { return !item.degree.trim() || !item.school.trim(); });
    var invalidCertification = state.certifications.some(function (item) { return !item.name.trim() || !item.issuer.trim() || (item.url && !validUrl(item.url)); });
    var extendedError = invalidExperience || invalidEducation || invalidCertification ? "Complete the title and organisation for every added entry, and use valid credential URLs." : "";
    $("#skills-error").textContent = skillError;
    $("#projects-error").textContent = projectError;
    $("#extended-work-error").textContent = extendedError;
    if (focusFirst && skillError) $("#skill-input").focus();
    return !skillError && !projectError && !extendedError;
  }

  function validateStep(stepNumber, focusFirst) {
    if (stepNumber === 4) return validateDetails(focusFirst);
    if (stepNumber === 5) return validateWork(focusFirst);
    return true;
  }

  function renderSkills() {
    var list = $("#skills-list");
    $("#skill-count").textContent = state.skills.length + " / 20";
    if (!state.skills.length) {
      list.innerHTML = '<p class="empty-state">No skills yet. Add the tools or strengths you want to highlight.</p>';
    } else {
      list.innerHTML = state.skills.map(function (skill, index) {
        return '<span class="tag">' + escapeHtml(skill) + '<button type="button" data-remove-skill="' + index + '" aria-label="Remove ' + escapeHtml(skill) + '">×</button></span>';
      }).join("");
    }
    updatePreview();
  }

  function renderProjects() {
    var list = $("#projects-list");
    if (!state.projects.length) {
      list.innerHTML = '<p class="empty-state">No projects yet. Add a project to show your work and its impact.</p>';
    } else {
      list.innerHTML = state.projects.map(function (project, index) {
        return '<div class="project-editor" data-project="' + index + '">' +
          '<button class="remove-project" data-remove-project="' + index + '" type="button" aria-label="Remove project">Remove</button>' +
          '<label>Project title *<input data-project-field="title" maxlength="90" value="' + escapeHtml(project.title) + '" placeholder="Project name"></label>' +
          '<label>Project URL<input data-project-field="url" type="url" maxlength="200" value="' + escapeHtml(project.url) + '" placeholder="https://example.com"></label>' +
          '<label>Description *<textarea data-project-field="description" maxlength="350" rows="4" placeholder="What did you build and what changed?">' + escapeHtml(project.description) + '</textarea></label></div>';
      }).join("");
    }
    $("#add-project").disabled = state.projects.length >= 3;
    updatePreview();
  }

  function renderServices() {
    var list = $("#services-list");
    $("#service-count").textContent = state.services.length + " / 6";
    if (!state.services.length) {
      list.innerHTML = '<p class="empty-state">No services yet. Add what you can offer.</p>';
    } else {
      list.innerHTML = state.services.map(function (service, index) {
        return '<span class="tag">' + escapeHtml(service) + '<button type="button" data-remove-service="' + index + '" aria-label="Remove ' + escapeHtml(service) + '">×</button></span>';
      }).join("");
    }
    updatePreview();
  }

  var collectionConfig = {
    experience: {
      list: "#experience-list", button: "#add-experience", empty: "No experience entries yet.",
      fields: [["role", "Role or position", "e.g. Software Engineering Intern"], ["organization", "Organisation", "Company or client"], ["period", "Period", "e.g. May 2026 — July 2026"], ["description", "Description", "Describe your responsibilities, contribution and results."]]
    },
    education: {
      list: "#education-list", button: "#add-education", empty: "No education entries yet.",
      fields: [["degree", "Degree or qualification", "e.g. B.Tech in Computer Science"], ["school", "Institution", "School or university"], ["period", "Period", "e.g. 2023 — 2027"], ["description", "Description", "Add relevant coursework, results or academic focus."]]
    },
    certifications: {
      list: "#certifications-list", button: "#add-certification", empty: "No certifications yet.",
      fields: [["name", "Certification", "Certificate name"], ["issuer", "Issuer", "Issuing organisation"], ["year", "Year", "e.g. 2026"], ["url", "Credential URL", "https://example.com/credential"]]
    }
  };

  function renderCollection(kind) {
    var config = collectionConfig[kind];
    var items = state[kind];
    var list = $(config.list);
    if (!items.length) {
      list.innerHTML = '<p class="empty-state">' + config.empty + '</p>';
    } else {
      list.innerHTML = items.map(function (item, index) {
        var fields = config.fields.map(function (field, fieldIndex) {
          var key = field[0];
          var isDescription = key === "description";
          var isUrl = key === "url";
          var control = isDescription
            ? '<textarea data-collection-field="' + key + '" maxlength="400" rows="4" placeholder="' + field[2] + '">' + escapeHtml(item[key]) + '</textarea>'
            : '<input data-collection-field="' + key + '" ' + (isUrl ? 'type="url" ' : '') + 'maxlength="200" value="' + escapeHtml(item[key]) + '" placeholder="' + field[2] + '">';
          return '<label class="' + (fieldIndex === 3 ? "wide-entry-field" : "") + '">' + field[1] + control + '</label>';
        }).join("");
        return '<div class="project-editor collection-editor" data-collection="' + kind + '" data-entry="' + index + '"><button class="remove-project" data-remove-entry="' + index + '" type="button" aria-label="Remove entry">Remove</button>' + fields + '</div>';
      }).join("");
    }
    $(config.button).disabled = items.length >= 3;
    updatePreview();
  }

  function updateReview() {
    readDetails();
    var missing = [];
    if (!state.fullName || !state.role || !state.email || state.bio.length < 30) missing.push("required personal details");
    if (!state.skills.length) missing.push("at least one skill");
    var summary = $("#review-summary");
    if (missing.length) summary.textContent = "Before publishing, complete " + missing.join(" and ") + ".";
    else summary.textContent = "Your required content is ready. Review desktop and mobile previews before publishing.";
  }

  function draftData() {
    return {
      step: state.step,
      type: state.type,
      theme: state.theme,
      color: state.color,
      radius: state.radius,
      fullName: state.fullName,
      role: state.role,
      location: state.location,
      bio: state.bio,
      skills: state.skills,
      projects: state.projects,
      services: state.services,
      experience: state.experience,
      education: state.education,
      certifications: state.certifications,
      sections: state.sections
    };
  }

  function saveDraft() {
    readDetails();
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draftData()));
      $("#save-state").textContent = "Saved locally";
      setStatus("Draft saved on this device. Contact details and résumé information were excluded.", "success");
    } catch (error) {
      $("#save-state").textContent = "Save failed";
      setStatus("The draft could not be saved. Browser storage may be unavailable.", "error");
    }
  }

  function loadDraft() {
    try {
      var saved = JSON.parse(localStorage.getItem(DRAFT_KEY) || "null");
      if (!saved || typeof saved !== "object") return;
      Object.keys(draftData()).forEach(function (key) {
        if (saved[key] !== undefined) state[key] = saved[key];
      });
      state.email = "";
      state.phone = "";
      state.linkedin = "";
      state.website = "";
      state.resumeName = "";
      $("#save-state").textContent = "Local draft loaded";
    } catch (error) {
      localStorage.removeItem(DRAFT_KEY);
      $("#save-state").textContent = "Draft reset";
    }
  }

  function applyStateToForm() {
    updateSelected("#type-options", state.type);
    updateSelected("#theme-options", state.theme);
    updateSelected("#colour-options", state.color);
    updateSelected("#radius-options", state.radius);
    $("#custom-colour").value = state.color;
    ["fullName", "role", "location", "email", "phone", "bio", "linkedin", "website"].forEach(function (key) {
      var id = key.replace(/[A-Z]/g, function (letter) { return "-" + letter.toLowerCase(); });
      $("#" + id).value = state[key] || "";
    });
    $("#bio-count").textContent = state.bio.length + " / 500";
    $$("[data-section]").forEach(function (checkbox) { checkbox.checked = state.sections[checkbox.dataset.section] !== false; });
    renderSkills();
    renderProjects();
    renderServices();
    renderCollection("experience");
    renderCollection("education");
    renderCollection("certifications");
    showStep(state.step || 1);
  }

  function encodePortfolio(data) {
    var bytes = new TextEncoder().encode(JSON.stringify(data));
    var binary = "";
    bytes.forEach(function (byte) { binary += String.fromCharCode(byte); });
    return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  }

  function decodePortfolio(value) {
    var normalized = value.replace(/-/g, "+").replace(/_/g, "/");
    while (normalized.length % 4) normalized += "=";
    var binary = atob(normalized);
    var bytes = Uint8Array.from(binary, function (character) { return character.charCodeAt(0); });
    return JSON.parse(new TextDecoder().decode(bytes));
  }

  function compressProfileImage(file) {
    return new Promise(function (resolve, reject) {
      var reader = new FileReader();
      reader.onerror = function () { reject(new Error("The image could not be read.")); };
      reader.onload = function () {
        var image = new Image();
        image.onerror = function () { reject(new Error("Choose a valid JPG, PNG or WebP image.")); };
        image.onload = function () {
          var size = 240;
          var sourceSize = Math.min(image.naturalWidth, image.naturalHeight);
          var sourceX = (image.naturalWidth - sourceSize) / 2;
          var sourceY = (image.naturalHeight - sourceSize) / 2;
          var canvas = document.createElement("canvas");
          canvas.width = size;
          canvas.height = size;
          var context = canvas.getContext("2d");
          context.drawImage(image, sourceX, sourceY, sourceSize, sourceSize, 0, 0, size, size);
          resolve(canvas.toDataURL("image/webp", 0.72));
        };
        image.src = reader.result;
      };
      reader.readAsDataURL(file);
    });
  }

  function publish() {
    if (!validateDetails(true)) {
      showStep(4);
      setStatus("Complete the required personal details before publishing.", "error");
      return;
    }
    if (!validateWork(true)) {
      showStep(5);
      setStatus("Add the required skills and complete any project cards.", "error");
      return;
    }
    var slug = $("#portfolio-slug").value.trim();
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
      $("#slug-error").textContent = "Use lowercase letters, numbers and single hyphens only.";
      $("#portfolio-slug").focus();
      return;
    }
    $("#slug-error").textContent = "";
    $("#publish").disabled = true;
    $("#publish-loading").hidden = false;
    $("#share-result").hidden = true;
    window.setTimeout(function () {
      try {
        var publishState = Object.assign({}, state, { step: 1, resumeName: "" });
        var base = window.location.href.split("#")[0];
        var url = base + "#portfolio=" + encodePortfolio(publishState);
        if (url.length > 90000) throw new Error("The prototype link is too long. Choose a smaller profile image or shorten project descriptions.");
        $("#share-url").value = url;
        $("#share-result").hidden = false;
        setStatus("Prototype link generated successfully.", "success");
      } catch (error) {
        setStatus(error.message || "The prototype link could not be generated.", "error");
      } finally {
        $("#publish").disabled = false;
        $("#publish-loading").hidden = true;
      }
    }, 650);
  }

  function bindEvents() {
    $$(".start-builder").forEach(function (button) { button.addEventListener("click", showBuilder); });
    $("#back-home").addEventListener("click", showLanding);
    $("#save-draft").addEventListener("click", saveDraft);
    $("#open-preview").addEventListener("click", function () {
      updatePreview();
      $("#preview-modal").hidden = false;
      $("#close-preview").focus();
    });
    $("#close-preview").addEventListener("click", function () { $("#preview-modal").hidden = true; });
    $("#preview-modal").addEventListener("click", function (event) { if (event.target === event.currentTarget) event.currentTarget.hidden = true; });
    document.addEventListener("keydown", function (event) { if (event.key === "Escape") $("#preview-modal").hidden = true; });

    $$(".step").forEach(function (button) {
      button.addEventListener("click", function () {
        var target = Number(button.dataset.step);
        if (target > state.step && !validateStep(state.step, true)) {
          setStatus("Please complete the highlighted fields before continuing.", "error");
          return;
        }
        showStep(target);
      });
    });
    $("#previous-step").addEventListener("click", function () { showStep(state.step - 1); });
    $("#next-step").addEventListener("click", function () {
      if (!validateStep(state.step, true)) {
        setStatus("Please complete the highlighted fields before continuing.", "error");
        return;
      }
      showStep(state.step + 1);
    });
    $$(".content-jump [data-scroll-editor]").forEach(function (button) {
      button.addEventListener("click", function () {
        var editor = $("#" + button.dataset.scrollEditor);
        $$(".editor-card").forEach(function (card) { card.classList.remove("editor-highlight"); });
        editor.classList.add("editor-highlight");
        editor.scrollIntoView({ behavior: "smooth", block: "start" });
        window.setTimeout(function () { editor.classList.remove("editor-highlight"); }, 1800);
      });
    });

    $("#type-options").addEventListener("click", function (event) {
      var choice = event.target.closest("[data-value]");
      if (!choice) return;
      state.type = choice.dataset.value;
      updateSelected("#type-options", state.type);
      updatePreview();
    });
    $("#theme-options").addEventListener("click", function (event) {
      var choice = event.target.closest("[data-value]");
      if (!choice) return;
      state.theme = choice.dataset.value;
      updateSelected("#theme-options", state.theme);
      updatePreview();
    });
    $("#colour-options").addEventListener("click", function (event) {
      var choice = event.target.closest(".colour");
      if (!choice) return;
      state.color = choice.dataset.value;
      $("#custom-colour").value = state.color;
      updateSelected("#colour-options", state.color);
      updatePreview();
    });
    $("#custom-colour").addEventListener("input", function (event) {
      state.color = event.target.value;
      $$(".colour").forEach(function (element) { element.classList.remove("selected"); element.setAttribute("aria-pressed", "false"); });
      updatePreview();
    });
    $("#radius-options").addEventListener("click", function (event) {
      var choice = event.target.closest("[data-value]");
      if (!choice) return;
      state.radius = Number(choice.dataset.value);
      updateSelected("#radius-options", state.radius);
      updatePreview();
    });

    $("#details-form").addEventListener("input", function (event) {
      readDetails();
      if (event.target.id === "bio") $("#bio-count").textContent = event.target.value.length + " / 500";
      if (event.target.id === "full-name" && !state.photoData) $("#profile-image-preview").textContent = initials(event.target.value);
      if (event.target.id) setFieldError(event.target.id, "");
    });
    $("#resume-file").addEventListener("change", function (event) {
      var file = event.target.files[0];
      if (!file) return;
      var extensionOk = /\.(pdf|doc|docx)$/i.test(file.name);
      var typeOk = !file.type || /pdf|msword|officedocument/.test(file.type);
      if (!extensionOk || !typeOk) {
        event.target.value = "";
        state.resumeName = "";
        $("#resume-name").textContent = "No file selected";
        setStatus("Choose a PDF, DOC or DOCX résumé.", "error");
        return;
      }
      if (file.size > MAX_FILE_BYTES) {
        event.target.value = "";
        state.resumeName = "";
        $("#resume-name").textContent = "No file selected";
        setStatus("The résumé must be 5 MB or smaller.", "error");
        return;
      }
      state.resumeName = file.name;
      $("#resume-name").textContent = file.name + " · validated locally";
      setStatus("Résumé validated. The file is not uploaded or stored in this prototype.", "success");
    });
    $("#profile-image-file").addEventListener("change", function (event) {
      var input = event.target;
      var file = input.files[0];
      if (!file) return;
      if (!/^image\/(jpeg|png|webp)$/i.test(file.type) || !/\.(jpe?g|png|webp)$/i.test(file.name)) {
        input.value = "";
        setStatus("Choose a JPG, PNG or WebP profile image.", "error");
        return;
      }
      if (file.size > MAX_FILE_BYTES) {
        input.value = "";
        setStatus("The profile image must be 5 MB or smaller.", "error");
        return;
      }
      $("#profile-image-name").textContent = "Preparing image…";
      compressProfileImage(file).then(function (dataUrl) {
        state.photoData = dataUrl;
        state.photoName = file.name;
        $("#profile-image-preview").innerHTML = '<img src="' + dataUrl + '" alt="">';
        $("#profile-image-name").textContent = file.name + " · resized securely in this browser";
        updatePreview();
        setStatus("Profile image added. The original file is not stored in your local draft.", "success");
      }).catch(function (error) {
        input.value = "";
        state.photoData = "";
        state.photoName = "";
        $("#profile-image-preview").textContent = initials(state.fullName);
        $("#profile-image-name").textContent = "No image selected";
        setStatus(error.message, "error");
      });
    });

    $("#skill-input").addEventListener("keydown", function (event) {
      if (event.key !== "Enter") return;
      event.preventDefault();
      var skill = event.target.value.trim();
      if (!skill) return;
      if (state.skills.length >= 20) { toast("You can add up to 20 skills."); return; }
      if (state.skills.some(function (existing) { return existing.toLowerCase() === skill.toLowerCase(); })) { toast("That skill is already included."); return; }
      state.skills.push(skill);
      event.target.value = "";
      $("#skills-error").textContent = "";
      renderSkills();
    });
    $("#skills-list").addEventListener("click", function (event) {
      var button = event.target.closest("[data-remove-skill]");
      if (!button) return;
      state.skills.splice(Number(button.dataset.removeSkill), 1);
      renderSkills();
    });
    $("#service-input").addEventListener("keydown", function (event) {
      if (event.key !== "Enter") return;
      event.preventDefault();
      var service = event.target.value.trim();
      if (!service) return;
      if (state.services.length >= 6) { toast("You can add up to six services."); return; }
      if (state.services.some(function (existing) { return existing.toLowerCase() === service.toLowerCase(); })) { toast("That service is already included."); return; }
      state.services.push(service);
      event.target.value = "";
      renderServices();
    });
    $("#services-list").addEventListener("click", function (event) {
      var button = event.target.closest("[data-remove-service]");
      if (!button) return;
      state.services.splice(Number(button.dataset.removeService), 1);
      renderServices();
    });
    $("#add-project").addEventListener("click", function () {
      if (state.projects.length >= 3) return;
      state.projects.push({ title: "", url: "", description: "" });
      renderProjects();
      var editors = $$(".project-editor");
      editors[editors.length - 1].querySelector("input").focus();
    });
    $("#projects-list").addEventListener("click", function (event) {
      var button = event.target.closest("[data-remove-project]");
      if (!button) return;
      state.projects.splice(Number(button.dataset.removeProject), 1);
      renderProjects();
    });
    $("#projects-list").addEventListener("input", function (event) {
      var editor = event.target.closest("[data-project]");
      var field = event.target.dataset.projectField;
      if (!editor || !field) return;
      state.projects[Number(editor.dataset.project)][field] = event.target.value;
      $("#projects-error").textContent = "";
      updatePreview();
    });
    Object.keys(collectionConfig).forEach(function (kind) {
      var config = collectionConfig[kind];
      $(config.button).addEventListener("click", function () {
        if (state[kind].length >= 3) return;
        var blank = {};
        config.fields.forEach(function (field) { blank[field[0]] = ""; });
        state[kind].push(blank);
        renderCollection(kind);
        var editors = $$(config.list + " .collection-editor");
        editors[editors.length - 1].querySelector("input").focus();
      });
      $(config.list).addEventListener("click", function (event) {
        var button = event.target.closest("[data-remove-entry]");
        if (!button) return;
        state[kind].splice(Number(button.dataset.removeEntry), 1);
        renderCollection(kind);
      });
      $(config.list).addEventListener("input", function (event) {
        var editor = event.target.closest("[data-entry]");
        var field = event.target.dataset.collectionField;
        if (!editor || !field) return;
        state[kind][Number(editor.dataset.entry)][field] = event.target.value;
        updatePreview();
      });
    });
    $$("[data-section]").forEach(function (checkbox) {
      checkbox.addEventListener("change", function () {
        state.sections[checkbox.dataset.section] = checkbox.checked;
        updatePreview();
      });
    });

    $$(".preview-size").forEach(function (button) {
      button.addEventListener("click", function () {
        $$(".preview-size").forEach(function (item) { item.classList.toggle("selected", item === button); });
        $("#preview-frame-wrap").classList.toggle("mobile", button.dataset.size === "mobile");
      });
    });
    $("#portfolio-slug").addEventListener("input", function (event) {
      event.target.value = event.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "").replace(/-+/g, "-");
      $("#slug-error").textContent = "";
    });
    $("#publish").addEventListener("click", publish);
    $("#copy-link").addEventListener("click", function () {
      var value = $("#share-url").value;
      if (!value) return;
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(value).then(function () { toast("Prototype link copied."); }).catch(function () { $("#share-url").select(); document.execCommand("copy"); toast("Prototype link copied."); });
      } else {
        $("#share-url").select();
        document.execCommand("copy");
        toast("Prototype link copied.");
      }
    });
    $$(".privacy-open").forEach(function (button) { button.addEventListener("click", function () { $("#privacy-dialog").showModal(); }); });
    $$(".privacy-close").forEach(function (button) { button.addEventListener("click", function () { $("#privacy-dialog").close(); }); });
  }

  function showPublishedFromHash() {
    if (window.location.hash.indexOf("#portfolio=") !== 0) return false;
    try {
      var published = decodePortfolio(window.location.hash.slice(11));
      document.open();
      document.write(portfolioDocument(published, true));
      document.close();
      return true;
    } catch (error) {
      window.location.hash = "";
      return false;
    }
  }

  function init() {
    if (showPublishedFromHash()) return;
    $$(".current-year").forEach(function (year) { year.textContent = new Date().getFullYear(); });
    loadDraft();
    applyStateToForm();
    bindEvents();
    showLanding();
    updatePreview();
  }

  init();
}());
