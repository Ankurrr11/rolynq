// extension/content.js

function extractJob() {
  let title = "", company = "", location = "", description = "";

  if (window.location.href.includes("linkedin.com")) {
    title = document.querySelector(".job-details-jobs-unified-top-card__job-title")?.innerText || 
            document.querySelector("h1")?.innerText;
    company = document.querySelector(".job-details-jobs-unified-top-card__company-name")?.innerText || 
              document.querySelector(".jobs-unified-top-card__company-name")?.innerText;
    location = document.querySelector(".job-details-jobs-unified-top-card__bullet")?.innerText || 
               document.querySelector(".jobs-unified-top-card__bullet")?.innerText;
    description = document.querySelector(".jobs-description-content__text")?.innerText || 
                  document.querySelector("#job-details")?.innerText;
  } else if (window.location.href.includes("ycombinator.com")) {
    title = document.querySelector("h1")?.innerText;
    company = document.querySelector(".font-bold.text-lg")?.innerText;
    description = document.querySelector(".job-description")?.innerText;
  }

  return { title, company, location, description, url: window.location.href };
}

// Add a button to the page
function injectButton() {
  if (document.getElementById("rolynq-btn")) return;

  const btn = document.createElement("button");
  btn.id = "rolynq-btn";
  btn.innerText = "🚀 Send to Rolynq";
  btn.style.cssText = "position:fixed; top:80px; right:20px; z-index:9999; background:#005f4b; color:white; border:none; padding:12px 20px; border-radius:30px; font-weight:bold; cursor:pointer; box-shadow:0 4px 15px rgba(0,0,0,0.2); font-family:sans-serif;";
  
  btn.onclick = async () => {
    btn.innerText = "⏳ Clipping...";
    const data = extractJob();
    try {
      const r = await fetch("http://localhost:5001/api/external/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      const d = await r.json();
      btn.innerText = `✅ Scored: ${d.score}%`;
      btn.style.background = "#059669";
      setTimeout(() => {
        btn.innerText = "🚀 Send to Rolynq";
        btn.style.background = "#005f4b";
      }, 3000);
    } catch (e) {
      btn.innerText = "❌ Error (Is App running?)";
      btn.style.background = "#dc2626";
    }
  };

  document.body.appendChild(btn);
}

// Run injection
setInterval(injectButton, 2000);
