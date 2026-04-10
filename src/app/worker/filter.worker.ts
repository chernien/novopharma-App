addEventListener('message', ({ data }) => {
    const { articles, search } = data;
  
    const normalizedSearch = search
      ?.trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  
    const filtered = articles.filter((article:any) =>
      article.arDesign.toLowerCase().includes(normalizedSearch) ||
      article.arRef.toLowerCase().includes(normalizedSearch)
    );
  
    postMessage(filtered);
  });
  