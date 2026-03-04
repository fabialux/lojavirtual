async function carregarPromocao() {
  try {
    const res = await fetch(`${window.API_URL}/api/promocao`);
    const promo = await res.json();

    if (!promo) return;

    document.getElementById("promoTitulo").innerText =
      promo.titulo || "Ofertas selecionadas";

    document.getElementById("promoDescricao").innerText =
      promo.descricao || "";

    const botao = document.getElementById("promoBotao");

    botao.innerText = promo.botao || "Conferir agora";
    botao.href = promo.link || "catalogo.html";

  } catch (err) {
    console.log("Erro ao carregar promoção:", err);
  }
}

carregarPromocao();