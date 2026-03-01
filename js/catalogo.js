const API_URL = window.location.hostname.includes("github.io")
  ? "https://lojavirtual-production.up.railway.app"
  : "http://localhost:3000";
const grid = document.querySelector("#productGrid");

function formatarPreco(valor){
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
}

async function carregarProdutos(){
  try {
    const response = await fetch(`${API_URL}/api/produtos`);
    const produtos = await response.json();

    grid.innerHTML = "";

    produtos.forEach((produto) => {
      const card = document.createElement("article");
      card.classList.add("card");

      card.innerHTML = `
        <div class="card__img">
          <img src="${API_URL}${produto.imagem}" alt="${produto.nome}">
        </div>

        <div class="card__body">
          <strong>${produto.nome}</strong>
          <span class="muted">${produto.marca} • ${produto.volume}</span>
          <span class="price">${formatarPreco(produto.preco)}</span>
          <button class="btn btn--small">Adicionar ao carrinho</button>
        </div>
      `;

      const botao = card.querySelector("button");
      botao.addEventListener("click", () => adicionarAoCarrinho(produto));

      grid.appendChild(card);
    });

  } catch (erro) {
    console.error("Erro ao carregar produtos:", erro);
  }
}

carregarProdutos();