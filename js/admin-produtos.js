const API_URL = window.location.hostname.includes("github.io")
  ? "https://lojavirtual-production.up.railway.app"
  : "http://localhost:3000";

const token = localStorage.getItem("admin_token");
if (!token) window.location.href = "login.html";

const tbody = document.getElementById("produtosTbody");
const reloadBtn = document.getElementById("reloadBtn");
const novoBtn = document.getElementById("novoBtn");

const buscaEl = document.getElementById("busca");
const filtroAtivoEl = document.getElementById("filtroAtivo");

const formBox = document.getElementById("formBox");
const formTitle = document.getElementById("formTitle");
const formMsg = document.getElementById("formMsg");

const f_nome = document.getElementById("f_nome");
const f_marca = document.getElementById("f_marca");
const f_volume = document.getElementById("f_volume");
const f_preco = document.getElementById("f_preco");
const f_imagem = document.getElementById("f_imagem");
const f_desc = document.getElementById("f_desc");
const f_ativo = document.getElementById("f_ativo");

const imgPreview = document.getElementById("imgPreview");
const salvarBtn = document.getElementById("salvarBtn");
const cancelarBtn = document.getElementById("cancelarBtn");

const logoutBtn = document.getElementById("logoutBtn");

let produtosCache = [];
let editId = null;

function headersAuth() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

function formatarPreco(valor) {
  return Number(valor || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function isUrlCompleta(s) {
  return typeof s === "string" && (s.startsWith("http://") || s.startsWith("https://"));
}

// Se for /assets/... usa do próprio GitHub Pages; se for URL completa, usa como está.
function resolverImagem(img) {
  if (!img) return "";
  if (isUrlCompleta(img)) return img;

  // GitHub Pages: precisa do /lojavirtual
  if (window.location.hostname.includes("github.io")) {
    const repo = window.location.pathname.split("/")[1] || "lojavirtual";
    return `https://${window.location.host}/${repo}${img}`;
  }

  return img;
}

function abrirFormNovo() {
  editId = null;
  formTitle.textContent = "Novo produto";
  formMsg.textContent = "";
  formBox.style.display = "block";

  f_nome.value = "";
  f_marca.value = "";
  f_volume.value = "100ml";
  f_preco.value = "0";
  f_imagem.value = "/assets/img/perfume1.jpg";
  f_desc.value = "";
  f_ativo.value = "true";

  atualizarPreview();
}

function abrirFormEditar(p) {
  editId = p.id;
  formTitle.textContent = `Editar produto #${p.id}`;
  formMsg.textContent = "";
  formBox.style.display = "block";

  f_nome.value = p.nome || "";
  f_marca.value = p.marca || "";
  f_volume.value = p.volume || "";
  f_preco.value = String(p.preco ?? 0);
  f_imagem.value = p.imagem || "";
  f_desc.value = p.descricao || "";
  f_ativo.value = String(!!p.ativo);

  atualizarPreview();
}

function fecharForm() {
  formBox.style.display = "none";
  formMsg.textContent = "";
}

function atualizarPreview() {
  const url = resolverImagem(f_imagem.value.trim());
  if (!url) {
    imgPreview.style.display = "none";
    return;
  }
  imgPreview.src = url;
  imgPreview.style.display = "block";
}

async function carregarProdutosAdmin() {
  const resp = await fetch(`${API_URL}/api/admin/produtos`, { headers: headersAuth() });
  const data = await resp.json().catch(() => ([]));
  if (!resp.ok) throw new Error(data.error || "Erro ao carregar produtos");
  produtosCache = data;
  render();
}

function aplicarFiltros(lista) {
  const termo = (buscaEl.value || "").trim().toLowerCase();
  const filtro = filtroAtivoEl.value;

  return lista.filter((p) => {
    const okTexto =
      !termo ||
      (p.nome || "").toLowerCase().includes(termo) ||
      (p.marca || "").toLowerCase().includes(termo);

    const okAtivo =
      filtro === "TODOS" ||
      (filtro === "ATIVOS" && p.ativo) ||
      (filtro === "INATIVOS" && !p.ativo);

    return okTexto && okAtivo;
  });
}

function render() {
  const lista = aplicarFiltros(produtosCache);
  tbody.innerHTML = "";

  if (!lista.length) {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td colspan="6" class="muted" style="padding:12px;">Nenhum produto encontrado.</td>`;
    tbody.appendChild(tr);
    return;
  }

  lista.forEach((p) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td style="padding:10px;">${p.id}</td>
      <td style="padding:10px;">
        <img src="${resolverImagem(p.imagem)}" alt="" style="width:48px;height:48px;object-fit:cover;border-radius:10px;border:1px solid #333;">
      </td>
      <td style="padding:10px;">
        <div><strong>${p.nome}</strong></div>
        <div class="muted">${p.marca} • ${p.volume}</div>
      </td>
      <td style="padding:10px;">${formatarPreco(p.preco)}</td>
      <td style="padding:10px;">${p.ativo ? "SIM" : "NÃO"}</td>
      <td style="padding:10px; display:flex; gap:8px; flex-wrap:wrap;">
        <button class="btn btn--outline btn--small" data-edit="${p.id}">Editar</button>
        <button class="btn btn--outline btn--small" data-price="${p.id}">Preço</button>
        <button class="btn btn--outline btn--small" data-toggle="${p.id}">
          ${p.ativo ? "Desativar" : "Ativar"}
        </button>
      </td>
    `;

    tbody.appendChild(tr);

    tr.querySelector(`[data-edit="${p.id}"]`).addEventListener("click", () => abrirFormEditar(p));
    tr.querySelector(`[data-price="${p.id}"]`).addEventListener("click", () => editarPrecoRapido(p));
    tr.querySelector(`[data-toggle="${p.id}"]`).addEventListener("click", () => toggleAtivo(p));
  });
}

async function editarPrecoRapido(p) {
  const novo = prompt(`Novo preço para "${p.nome}"`, String(p.preco ?? 0));
  if (novo === null) return;

  const preco = Number(String(novo).replace(",", "."));
  if (!Number.isFinite(preco) || preco < 0) {
    alert("Preço inválido.");
    return;
  }

  const resp = await fetch(`${API_URL}/api/admin/produtos/${p.id}`, {
    method: "PATCH",
    headers: headersAuth(),
    body: JSON.stringify({ preco }),
  });

  const data = await resp.json().catch(() => ({}));
  if (!resp.ok) throw new Error(data.error || "Erro ao atualizar preço");

  await carregarProdutosAdmin();
}

async function toggleAtivo(p) {
  const resp = await fetch(`${API_URL}/api/admin/produtos/${p.id}`, {
    method: "PATCH",
    headers: headersAuth(),
    body: JSON.stringify({ ativo: !p.ativo }),
  });

  const data = await resp.json().catch(() => ({}));
  if (!resp.ok) throw new Error(data.error || "Erro ao alterar ativo");

  await carregarProdutosAdmin();
}

async function salvarProduto() {
  formMsg.textContent = "";

  const payload = {
    nome: f_nome.value.trim(),
    marca: f_marca.value.trim(),
    volume: f_volume.value.trim(),
    preco: Number(String(f_preco.value).replace(",", ".")),
    imagem: f_imagem.value.trim(),
    descricao: f_desc.value.trim(),
    ativo: f_ativo.value === "true",
  };

  if (!payload.nome) throw new Error("Nome é obrigatório.");
  if (!payload.marca) throw new Error("Marca é obrigatória.");
  if (!payload.volume) throw new Error("Volume é obrigatório.");
  if (!Number.isFinite(payload.preco)) throw new Error("Preço inválido.");

  const url = editId
    ? `${API_URL}/api/admin/produtos/${editId}`
    : `${API_URL}/api/admin/produtos`;

  const method = editId ? "PATCH" : "POST";

  const resp = await fetch(url, {
    method,
    headers: headersAuth(),
    body: JSON.stringify(payload),
  });

  const data = await resp.json().catch(() => ({}));
  if (!resp.ok) throw new Error(data.error || "Erro ao salvar");

  fecharForm();
  await carregarProdutosAdmin();
}

// eventos
reloadBtn.addEventListener("click", () => carregarProdutosAdmin());
novoBtn.addEventListener("click", () => abrirFormNovo());
cancelarBtn.addEventListener("click", fecharForm);
salvarBtn.addEventListener("click", () => salvarProduto().catch((e) => (formMsg.textContent = e.message)));

buscaEl.addEventListener("input", render);
filtroAtivoEl.addEventListener("change", render);
f_imagem.addEventListener("input", atualizarPreview);

logoutBtn?.addEventListener("click", () => {
  localStorage.removeItem("admin_token");
  window.location.href = "login.html";
});

logoutBtn?.addEventListener("click", () => {
  localStorage.removeItem("admin_token");
  window.location.href = "index.html";
});