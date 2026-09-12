/**
 * PDF GENERATOR - BPI Governança
 * Geração de Propostas em PDF usando jsPDF
 * Inclua no HTML: <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
 */

class PDFGenerator {
  constructor() {
    // Verificar se jsPDF está disponível
    this.jsPDF = window.jsPDF ? window.jsPDF.jsPDF : null;
    if (!this.jsPDF) {
      console.warn('jsPDF não carregado. Adicione o script antes de usar.');
    }
  }

  /**
   * Gerar PDF de Proposta Comercial
   */
  gerarProposta(dados) {
    if (!this.jsPDF) {
      alert('jsPDF não está carregado. Verifique a instalação.');
      return null;
    }

    const { jsPDF } = window;
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // Cores
    const corOuro = [201, 166, 107];
    const corEscuro = [26, 26, 26];
    const corCinza = [75, 75, 75];

    // Dimensões
    const pageHeight = doc.internal.pageSize.getHeight();
    const pageWidth = doc.internal.pageSize.getWidth();
    let yPosition = 10;

    // ===== HEADER =====
    this.desenharHeader(doc, dados, yPosition);
    yPosition += 50;

    // ===== DADOS DO CLIENTE =====
    doc.setFont('Montserrat', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(...corEscuro);
    doc.text('DADOS DO CLIENTE', 10, yPosition);

    doc.setDrawColor(...corOuro);
    doc.line(10, yPosition + 2, 200, yPosition + 2);
    yPosition += 8;

    doc.setFont('Montserrat', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(...corCinza);

    const clienteInfo = [
      `Empresa: ${dados.nomeEmpresa}`,
      `Email: ${dados.emailCliente}`,
      `Projeto: ${dados.nomeProjeto}`,
      `Modalidade: ${dados.modalidade}`
    ];

    clienteInfo.forEach(info => {
      doc.text(info, 10, yPosition);
      yPosition += 6;
    });

    yPosition += 5;

    // ===== ESCOPO =====
    doc.setFont('Montserrat', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(...corEscuro);
    doc.text('ESCOPO DO PROJETO', 10, yPosition);

    doc.setDrawColor(...corOuro);
    doc.line(10, yPosition + 2, 200, yPosition + 2);
    yPosition += 8;

    doc.setFont('Montserrat', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(...corCinza);

    const escopoWrapped = doc.splitTextToSize(dados.escopoDescricao, 190);
    doc.text(escopoWrapped, 10, yPosition);
    yPosition += escopoWrapped.length * 4 + 5;

    // Verificar se precisa de nova página
    if (yPosition > pageHeight - 40) {
      doc.addPage();
      yPosition = 10;
    }

    // ===== SERVIÇOS CONTRATADOS =====
    doc.setFont('Montserrat', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(...corEscuro);
    doc.text('SERVIÇOS CONTRATADOS', 10, yPosition);

    doc.setDrawColor(...corOuro);
    doc.line(10, yPosition + 2, 200, yPosition + 2);
    yPosition += 8;

    if (dados.produtos && dados.produtos.length > 0) {
      dados.produtos.forEach((produto, index) => {
        doc.setFont('Montserrat', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(...corEscuro);
        doc.text(`${index + 1}. ${produto.nome}`, 10, yPosition);
        yPosition += 5;

        doc.setFont('Montserrat', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(...corCinza);

        if (produto.tipo === 'setup') {
          doc.text(`Valor: R$ ${produto.valor.toLocaleString('pt-BR')}`, 15, yPosition);
        } else {
          doc.text(`Valor: R$ ${produto.valor.toLocaleString('pt-BR')}/mês`, 15, yPosition);
        }
        yPosition += 4;
      });
    }

    yPosition += 5;

    // ===== INVESTIMENTO =====
    if (yPosition > pageHeight - 60) {
      doc.addPage();
      yPosition = 10;
    }

    doc.setFont('Montserrat', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(...corEscuro);
    doc.text('INVESTIMENTO', 10, yPosition);

    doc.setDrawColor(...corOuro);
    doc.line(10, yPosition + 2, 200, yPosition + 2);
    yPosition += 8;

    // Calcular valores
    const { setup, recorrente, total } = this.calcularInvestimento(dados);

    // Box de investimento
    doc.setFillColor(...corOuro);
    doc.rect(10, yPosition, 190, 30, 'F');

    doc.setFont('Montserrat', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(255, 255, 255);
    doc.text(`INVESTIMENTO TOTAL: R$ ${total.toLocaleString('pt-BR')}`, 15, yPosition + 12);

    doc.setFont('Montserrat', 'normal');
    doc.setFontSize(9);
    doc.text(`Setup: R$ ${setup.toLocaleString('pt-BR')} | Recorrência: R$ ${recorrente.toLocaleString('pt-BR')}/mês`, 15, yPosition + 22);

    yPosition += 35;

    // ===== PRAZOS E CONDIÇÕES =====
    doc.setFont('Montserrat', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(...corEscuro);
    doc.text('PRAZOS E CONDIÇÕES', 10, yPosition);

    doc.setDrawColor(...corOuro);
    doc.line(10, yPosition + 2, 200, yPosition + 2);
    yPosition += 8;

    doc.setFont('Montserrat', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(...corCinza);

    const condicoes = [
      `Prazo do Projeto: ${dados.prazo} dias`,
      `Validade da Proposta: ${dados.validade} dias`,
      `Forma de Faturamento: ${dados.faturamento}`,
      `Modalidade: ${dados.modalidade}`
    ];

    condicoes.forEach(condicao => {
      doc.text(condicao, 10, yPosition);
      yPosition += 6;
    });

    // ===== RODAPÉ =====
    this.desenharRodape(doc, dados);

    return doc;
  }

  /**
   * Desenhar header com logo e informações
   */
  desenharHeader(doc, dados, yPosition) {
    const corOuro = [201, 166, 107];
    const corEscuro = [26, 26, 26];

    // Fundo
    doc.setFillColor(...corOuro);
    doc.rect(0, 0, 210, 40, 'F');

    // Título
    doc.setFont('PlayfairDisplay', 'bold');
    doc.setFontSize(28);
    doc.setTextColor(255, 255, 255);
    doc.text('BPI GOVERNANÇA', 15, 20);

    // Subtítulo
    doc.setFont('Montserrat', 'normal');
    doc.setFontSize(10);
    doc.text('PROPOSTA COMERCIAL', 15, 30);

    // Número da proposta
    doc.setFont('Montserrat', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(255, 255, 255);
    doc.text(`Proposta #${this.gerarNumeroUnico()}`, 170, 20);

    doc.setFont('Montserrat', 'normal');
    doc.setFontSize(9);
    doc.text(`Data: ${new Date().toLocaleDateString('pt-BR')}`, 170, 30);
  }

  /**
   * Desenhar rodapé
   */
  desenharRodape(doc, dados) {
    const pageHeight = doc.internal.pageSize.getHeight();
    const corCinza = [75, 75, 75];

    doc.setDrawColor(200, 200, 200);
    doc.line(10, pageHeight - 20, 200, pageHeight - 20);

    doc.setFont('Montserrat', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...corCinza);
    doc.text('BPI Governança | www.bpigovernanca.com.br | (11) 3000-0000', 10, pageHeight - 15);
    doc.text(`Responsável: ${dados.elaboradoPor || 'Equipe BPI'} | Confidencial`, 10, pageHeight - 10);
  }

  /**
   * Calcular investimento total
   */
  calcularInvestimento(dados) {
    let setup = 0;
    let recorrente = 0;

    if (dados.produtos) {
      dados.produtos.forEach(p => {
        if (p.tipo === 'setup') {
          setup += p.valor;
        } else {
          recorrente += p.valor;
        }
      });
    }

    // Aplicar desconto
    const desconto = (dados.desconto || 0) / 100;
    setup = setup * (1 - desconto);

    const total = setup + (recorrente * 12);

    return { setup, recorrente, total };
  }

  /**
   * Gerar número único para proposta
   */
  gerarNumeroUnico() {
    return `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 9999)).padStart(4, '0')}`;
  }

  /**
   * Download do PDF
   */
  downloadPDF(doc, nomeArquivo = 'proposta.pdf') {
    doc.save(nomeArquivo);
  }

  /**
   * Abrir PDF em nova aba
   */
  abrirPDF(doc) {
    const url = doc.output('bloburi');
    window.open(url, '_blank');
  }
}

// Exportar
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PDFGenerator;
}