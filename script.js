const CONFIG = {
  // Cole aqui a URL do Web App do Google Apps Script depois de publicar.
  appsScriptUrl: "https://script.google.com/macros/s/AKfycbwiYUxzrlXbkzXvDDVBRt6u7NGrefXBX2oM36quHKMV8hFHncm39UiByKHX_D-UrYGT/exec",
  storageKey: "painel-gerador-logins:v1"
};

const state = loadState();

const els = {
  form: document.querySelector("#registroForm"),
  olt: document.querySelector("#olt"),
  pon: document.querySelector("#pon"),
  tecnico: document.querySelector("#tecnico"),
  suporte: document.querySelector("#suporte"),
  observacoes: document.querySelector("#observacoes"),
  evidencia: document.querySelector("#evidencia"),
  resumo: document.querySelector("#resumo"),
  copiarResumo: document.querySelector("#copiarResumo"),
  salvarRegistro: document.querySelector("#salvarRegistro"),
  formStatus: document.querySelector("#formStatus"),
  nomeCompleto: document.querySelector("#nomeCompleto"),
  limparNome: document.querySelector("#limparNome"),
  loginList: document.querySelector("#loginList"),
  loginStatus: document.querySelector("#loginStatus"),
  buscaHistorico: document.querySelector("#buscaHistorico"),
  historicoBody: document.querySelector("#historicoBody"),
  navButtons: document.querySelectorAll(".nav-button"),
  dashboardViews: document.querySelectorAll(".dashboard-view"),
  dashboardTitle: document.querySelector("#dashboardTitle"),
  dashboardSubtitle: document.querySelector("#dashboardSubtitle"),
  sparkCanvas: document.querySelector("#sparkCanvas"),
  totalRegistros: document.querySelector("#totalRegistros"),
  totalOlts: document.querySelector("#totalOlts"),
  totalTecnicos: document.querySelector("#totalTecnicos"),
  loginsGerados: document.querySelector("#loginsGerados"),
  loginsCopiados: document.querySelector("#loginsCopiados"),
  totalUsos: document.querySelector("#totalUsos")
};

["input", "change"].forEach((eventName) => {
  els.form.addEventListener(eventName, atualizarResumo);
});

els.form.addEventListener("submit", salvarRegistro);
els.copiarResumo.addEventListener("click", () => copiarTexto(els.resumo.value, "Resumo copiado.", els.formStatus));
els.nomeCompleto.addEventListener("input", renderLogins);
els.limparNome.addEventListener("click", () => {
  els.nomeCompleto.value = "";
  renderLogins();
  els.nomeCompleto.focus();
});
els.buscaHistorico.addEventListener("input", renderHistorico);
els.navButtons.forEach((button) => {
  button.addEventListener("click", () => trocarDashboard(button.dataset.dashboard));
});

atualizarResumo();
renderLogins();
renderHistorico();
renderStats();
iniciarMalhaDoMouse();

function trocarDashboard(dashboardName) {
  els.navButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.dashboard === dashboardName);
  });

  els.dashboardViews.forEach((view) => {
    const active = view.id === `dashboard-${dashboardName}`;
    view.classList.toggle("active", active);
    if (active) {
      els.dashboardTitle.textContent = view.dataset.title;
      els.dashboardSubtitle.textContent = view.dataset.subtitle;
    }
  });
}

function loadState() {
  const fallback = { registros: [], loginsGerados: 0, loginsCopiados: 0, lastGeneratedKey: "" };
  try {
    return { ...fallback, ...JSON.parse(localStorage.getItem(CONFIG.storageKey)) };
  } catch {
    return fallback;
  }
}

function persistState() {
  localStorage.setItem(CONFIG.storageKey, JSON.stringify(state));
}

function atualizarResumo() {
  const data = formatDate(new Date());
  const partes = [
    `Data: ${data}`,
    `OLT: ${els.olt.value || "-"}`,
    `SLOT/PON: ${els.pon.value || "-"}`,
    `Tecnico de Campo: ${els.tecnico.value || "-"}`,
    `Suporte Responsavel: ${els.suporte.value || "-"}`,
    `Observacoes Tecnicas: ${els.observacoes.value || "-"}`,
    `Link da Evidencia: ${els.evidencia.value || "-"}`
  ];
  els.resumo.value = partes.join("\n");
}

async function salvarRegistro(event) {
  event.preventDefault();
  atualizarResumo();

  const registro = {
    data: new Date().toISOString(),
    dataFormatada: formatDate(new Date()),
    olt: els.olt.value.trim(),
    pon: els.pon.value.trim(),
    tecnico: els.tecnico.value.trim(),
    suporte: els.suporte.value.trim(),
    observacoes: els.observacoes.value.trim(),
    evidencia: els.evidencia.value.trim()
  };

  setStatus("Salvando registro...", "");
  els.salvarRegistro.disabled = true;

  try {
    await enviarParaPlanilha(registro);
    state.registros.unshift(registro);
    persistState();
    els.form.reset();
    atualizarResumo();
    renderHistorico();
    renderStats();
    setStatus("Registro salvo com sucesso.", "success");
  } catch (error) {
    setStatus(error.message, "error");
  } finally {
    els.salvarRegistro.disabled = false;
  }
}

async function enviarParaPlanilha(registro) {
  if (!CONFIG.appsScriptUrl) {
    return;
  }

  const body = new URLSearchParams();
  Object.entries(registro).forEach(([key, value]) => {
    body.append(key, value || "");
  });

  return fetch(CONFIG.appsScriptUrl, {
    method: "POST",
    mode: "no-cors",
    body
  });
}

function renderLogins() {
  const nome = els.nomeCompleto.value.trim();
  const logins = gerarLogins(nome);

  els.loginList.innerHTML = "";

  if (!logins.length) {
    els.loginList.innerHTML = `<div class="login-card"><div><small>Digite o nome completo</small><code>aguardando_dados_UNI</code></div><span class="badge">UNI</span></div>`;
    return;
  }

  const generatedKey = normalizarNome(nome).join(".");
  if (generatedKey && state.lastGeneratedKey !== generatedKey) {
    state.loginsGerados += logins.length;
    state.lastGeneratedKey = generatedKey;
    persistState();
    renderStats();
  }

  logins.forEach((item, index) => {
    const card = document.createElement("article");
    card.className = `login-card${index === 0 ? " main" : ""}`;
    card.innerHTML = `
      <div>
        <small>${item.rotulo}</small>
        <code>${item.login}</code>
      </div>
      <span class="badge">${index === 0 ? "PRINCIPAL" : "ALT"}</span>
      <button class="copy-login" type="button">Copiar</button>
    `;
    card.querySelector("button").addEventListener("click", () => {
      state.loginsCopiados += 1;
      persistState();
      renderStats();
      copiarTexto(item.login, "Login copiado.", els.loginStatus);
    });
    els.loginList.appendChild(card);
  });
}

function gerarLogins(nome) {
  const partes = normalizarNome(nome);
  if (partes.length < 2) return [];

  const primeiro = partes[0];
  const segundo = partes[1] || "";
  const ultimo = partes[partes.length - 1];
  const inicialUltimo = ultimo ? ultimo.charAt(0) : "";
  const inicialSegundo = segundo ? segundo.charAt(0) : "";

  const candidatos = [
    {
      rotulo: "Opcao principal (primeiro.ultimo)",
      login: [primeiro, ultimo].filter(Boolean).join(".")
    },
    {
      rotulo: "Alternativa 2 (primeiro.segundo)",
      login: [primeiro, segundo].filter(Boolean).join(".")
    },
    {
      rotulo: "Alternativa 3 (primeiro.segundo.ultimo)",
      login: [primeiro, segundo, ultimo].filter(Boolean).join(".")
    },
    {
      rotulo: "Alternativa 4 (primeiro.inicial ultimo)",
      login: `${primeiro}.${inicialUltimo || inicialSegundo}`
    }
  ];

  const unicos = new Map();
  candidatos.forEach((item) => {
    const login = `${item.login}_UNI`;
    if (item.login && !unicos.has(login)) unicos.set(login, { ...item, login });
  });

  return [...unicos.values()].slice(0, 4);
}

function normalizarNome(nome) {
  return nome
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z\s]/g, " ")
    .split(/\s+/)
    .filter((parte) => parte && !["de", "da", "do", "das", "dos", "e"].includes(parte));
}

function renderHistorico() {
  const termo = els.buscaHistorico.value.trim().toLowerCase();
  const registros = state.registros.filter((registro) =>
    Object.values(registro).join(" ").toLowerCase().includes(termo)
  );

  els.historicoBody.innerHTML = registros
    .map(
      (registro) => `
        <tr>
          <td>${escapeHtml(registro.dataFormatada)}</td>
          <td>${escapeHtml(registro.olt)}</td>
          <td>${escapeHtml(registro.pon)}</td>
          <td>${escapeHtml(registro.tecnico)}</td>
          <td>${escapeHtml(registro.suporte || "-")}</td>
          <td>${escapeHtml(registro.observacoes || "-")}</td>
          <td>${registro.evidencia ? `<a href="${escapeAttribute(registro.evidencia)}" target="_blank" rel="noreferrer">Abrir</a>` : "-"}</td>
        </tr>
      `
    )
    .join("");
}

function renderStats() {
  const olts = new Set(state.registros.map((item) => item.olt).filter(Boolean));
  const tecnicos = new Set(state.registros.map((item) => item.tecnico).filter(Boolean));
  els.totalRegistros.textContent = state.registros.length;
  els.totalOlts.textContent = olts.size;
  els.totalTecnicos.textContent = tecnicos.size;
  els.loginsGerados.textContent = state.loginsGerados;
  els.loginsCopiados.textContent = state.loginsCopiados;
  els.totalUsos.textContent = state.loginsGerados + state.registros.length;
}

async function copiarTexto(texto, mensagem, target = els.formStatus) {
  if (!texto) return;
  await navigator.clipboard.writeText(texto);
  setStatus(mensagem, "success", target);
}

function setStatus(message, type, target = els.formStatus) {
  target.textContent = message;
  target.className = `form-status ${type}`;
}

function formatDate(date) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short"
  }).format(date);
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function escapeAttribute(value) {
  return escapeHtml(value).replace(/`/g, "&#096;");
}

function iniciarMalhaDoMouse() {
  const canvas = els.sparkCanvas;
  const ctx = canvas.getContext("2d");
  const nodes = [];
  const mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2, active: false };
  const sidebar = document.querySelector(".sidebar");
  const appHeader = document.querySelector(".app-header");
  let width = 0;
  let height = 0;

  function resize() {
    const ratio = window.devicePixelRatio || 1;
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.floor(width * ratio);
    canvas.height = Math.floor(height * ratio);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    criarMalha();
  }

  function criarMalha() {
    nodes.length = 0;
    const total = Math.max(90, Math.min(180, Math.floor((width * height) / 9500)));

    for (let i = 0; i < total; i += 1) {
      nodes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        baseX: Math.random() * width,
        baseY: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.22,
        vy: (Math.random() - 0.5) * 0.22,
        size: 1.8 + Math.random() * 2.6
      });
    }
  }

  window.addEventListener("resize", resize);
  window.addEventListener("mousemove", (event) => {
    mouse.x = event.clientX;
    mouse.y = event.clientY;
    mouse.active = true;
  });

  window.addEventListener("mouseleave", () => {
    mouse.active = false;
  });

  function getMeshRegions() {
    const sidebarRect = sidebar.getBoundingClientRect();
    const headerRect = appHeader.getBoundingClientRect();

    return [
      {
        x: sidebarRect.left,
        y: sidebarRect.top,
        width: sidebarRect.width,
        height: sidebarRect.height
      },
      {
        x: sidebarRect.right,
        y: 0,
        width: width - sidebarRect.right,
        height: Math.max(130, headerRect.bottom + 18)
      }
    ];
  }

  function atualizarMalha() {
    const mouseDistance = 310;

    nodes.forEach((node) => {
      node.x += node.vx;
      node.y += node.vy;

      if (node.x < -20 || node.x > width + 20) node.vx *= -1;
      if (node.y < -20 || node.y > height + 20) node.vy *= -1;

      if (mouse.active) {
        const dx = mouse.x - node.x;
        const dy = mouse.y - node.y;
        const distance = Math.hypot(dx, dy);

        if (distance < mouseDistance) {
          const pull = (1 - distance / mouseDistance) * 0.018;
          node.vx += dx * pull;
          node.vy += dy * pull;
        }
      }

      node.vx *= 0.985;
      node.vy *= 0.985;
    });
  }

  function renderizarMalha() {
    const maxDistance = 198;
    const mouseDistance = 310;

    for (let i = 0; i < nodes.length; i += 1) {
      for (let j = i + 1; j < nodes.length; j += 1) {
        const a = nodes[i];
        const b = nodes[j];
        const distance = Math.hypot(a.x - b.x, a.y - b.y);

        if (distance > maxDistance) continue;

        const alpha = (1 - distance / maxDistance) * 0.52;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.strokeStyle = `rgba(229, 251, 255, ${alpha})`;
        ctx.lineWidth = 1.25;
        ctx.shadowColor = "rgba(5, 215, 255, 0.42)";
        ctx.shadowBlur = 9;
        ctx.stroke();
      }
    }

    if (mouse.active) {
      nodes.forEach((node) => {
        const distance = Math.hypot(mouse.x - node.x, mouse.y - node.y);
        if (distance > mouseDistance) return;

        const alpha = (1 - distance / mouseDistance) * 0.86;
        ctx.beginPath();
        ctx.moveTo(mouse.x, mouse.y);
        ctx.lineTo(node.x, node.y);
        ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.lineWidth = 1.55;
        ctx.shadowColor = "rgba(5, 215, 255, 0.82)";
        ctx.shadowBlur = 16;
        ctx.stroke();
      });
    }

    nodes.forEach((node) => {
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.size, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(244, 253, 255, 0.9)";
      ctx.shadowColor = "rgba(5, 215, 255, 0.82)";
      ctx.shadowBlur = 14;
      ctx.fill();
    });
  }

  function desenharMalha() {
    atualizarMalha();

    getMeshRegions().forEach((region) => {
      ctx.save();
      ctx.beginPath();
      ctx.rect(region.x, region.y, region.width, region.height);
      ctx.clip();
      renderizarMalha();
      ctx.restore();
    });
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);
    desenharMalha();

    requestAnimationFrame(animate);
  }

  resize();
  animate();
}
