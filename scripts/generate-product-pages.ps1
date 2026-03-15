$ErrorActionPreference = "Stop"

$dataUrl = "https://script.google.com/macros/s/AKfycbwt8ykNWFXMz2RRBaI3KJfglZdxLk7UnICPAOJC6cHP6VWH_Yk9-aDV8Xlb4YfKnu14GA/exec"
$siteUrl = $env:SITE_URL
if (-not $siteUrl) { $siteUrl = "" }
$siteUrl = $siteUrl.TrimEnd("/")
$outDir = Join-Path $PSScriptRoot "..\\produtos"

function Escape-Html($text) {
  if (-not $text) { $text = "" }
  return $text -replace "&", "&amp;" -replace "<", "&lt;" -replace ">", "&gt;" -replace '"', "&quot;" -replace "'", "&#39;"
}

function Truncate-Text($text, $max) {
  if (-not $text) { $text = "" }
  $clean = ($text -replace "\s+", " ").Trim()
  if ($clean.Length -le $max) { return $clean }
  return ($clean.Substring(0, $max - 1).Trim() + "…")
}

function Build-Page($produto) {
  $id = ($produto.id).ToString().Trim()
  if (-not $id) { $id = "" }
  $name = Escape-Html($produto.name)
  if (-not $name) { $name = "Produto" }
  $descRaw = $produto.ProductDescription
  if (-not $descRaw) { $descRaw = $produto.description }
  if (-not $descRaw) { $descRaw = "Produto disponível para venda." }
  $desc = Escape-Html($descRaw)
  $detailsRaw = $produto.ProductDetails
  if (-not $detailsRaw) { $detailsRaw = $produto.details }
  if (-not $detailsRaw) { $detailsRaw = "" }
  $details = Escape-Html($detailsRaw)
  $priceValue = $produto.price
  if (-not $priceValue) { $priceValue = 0 }
  $price = ([double]$priceValue).ToString("C", (New-Object System.Globalization.CultureInfo("pt-BR")))
  $images = @($produto.imageUrl, $produto.imageUrl1, $produto.imageUrl2, $produto.imageUrl3) | Where-Object { $_ }
  $mainImage = if ($images.Count -gt 0) { $images[0] } else { "https://res.cloudinary.com/dknntq75l/image/upload/v1753806676/galeria_imagens/cgvgwtx1neyt6b0cdsdc.jpg" }
  $pagePath = "produtos/$([uri]::EscapeDataString($id)).html"
  $pageUrl = if ($siteUrl) { "$siteUrl/$pagePath" } else { "" }

  $ogUrlTag = if ($pageUrl) { "<meta property=`"og:url`" content=`"$pageUrl`">" } else { "" }
  $canonicalTag = if ($pageUrl) { "<link rel=`"canonical`" href=`"$pageUrl`">" } else { "" }

  $thumbs = ($images | ForEach-Object -Begin { $i = 0 } -Process {
    $i++
    "<button type=`"button`" data-img=`"$_`" aria-label=`"Ver foto $i`"><img src=`"$_`" alt=`"$name - foto $i`"></button>"
  }) -join ""

  $waText = [uri]::EscapeDataString("Olá, esse item ainda está disponível?`n`nItem: $($produto.name)`nCódigo: $id")

@"
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="description" content="$(Escape-Html (Truncate-Text $descRaw 150))">
  <meta name="theme-color" content="#ffde59">
  <meta property="og:type" content="product">
  <meta property="og:locale" content="pt_BR">
  <meta property="og:title" content="$name | Manutenção do Lar">
  <meta property="og:description" content="$(Escape-Html (Truncate-Text $descRaw 180))">
  <meta property="og:image" content="$mainImage">
  $ogUrlTag
  <meta name="twitter:card" content="summary_large_image">
  $canonicalTag
  <link rel="stylesheet" href="../css/estilo.css">
  <title>$name | Manutenção do Lar</title>
</head>
<body>
  <header id="header">
    <a href="/"><img id="img-logo" src="../img/logo.jpg" alt="logo"></a>
    <a id="logo" href="/">Manutenção do Lar</a>
    <nav id="nav">
      <button aria-label="Abrir Menu" id="btn-mobile" aria-haspopup="true" aria-controls="menu" aria-expanded="false"><!--Menu-->
          <span id="hamburger"></span>
      </button>
      <ul id="menu">
         <li><a href="/">Home</a></li>
         <li><a href="/#formulario">Solicite um orçamento</a></li>
         <li><a href="../vendas.html">Serviços e Ativos</a></li>
      </ul>
    </nav>
  </header>

  <main class="product-page">
    <section class="product-hero visible">
      <h1>$name</h1>
      <p class="product-meta"><strong>Valor:</strong> $price</p>
      <div class="product-gallery">
        <div>
          <img id="main-image" src="$mainImage" alt="$name">
        </div>
        <div class="product-thumbs">
          $thumbs
        </div>
      </div>
      <div class="product-meta">
        <p><strong>Características:</strong> $desc</p>
        $(if ($details) { "<p><strong>Descrição:</strong> $details</p>" } else { "" })
      </div>
      <div class="product-cta">
        <a class="btn btn-whatsapp" href="https://wa.me/5567981827065?text=$waText" target="_blank" rel="noopener noreferrer">Chamar no WhatsApp</a>
        <a class="btn btn-primary" href="../vendas.html">Ver todos os produtos</a>
      </div>
      <a class="product-back" href="../vendas.html">Voltar para a lista</a>
    </section>
  </main>

  <script src="../js/menu.js" defer></script>
  <script>
    const mainImage = document.getElementById("main-image");
    document.querySelectorAll(".product-thumbs button").forEach(btn => {
      btn.addEventListener("click", () => {
        mainImage.src = btn.getAttribute("data-img");
      });
    });
  </script>
</body>
</html>
"@
}

$response = Invoke-RestMethod -Uri $dataUrl -Method Get
$produtos = $response.saida

New-Item -ItemType Directory -Force -Path $outDir | Out-Null

$count = 0
foreach ($produto in $produtos) {
  $id = ($produto.id).ToString().Trim()
  if (-not $id) { $id = "" }
  if (-not $id) { continue }
  $fileName = [uri]::EscapeDataString($id) + ".html"
  $filePath = Join-Path $outDir $fileName
  $html = Build-Page $produto
  Set-Content -Path $filePath -Value $html -Encoding UTF8
  $count++
}

Write-Host "Geradas $count paginas em $outDir"
