/**
 * Shared print styles for inspection reports
 * Use with dangerouslySetInnerHTML in pages that need print support
 */
export const PRINT_STYLES = `
  @media print {
    body { 
      background-color: white !important; 
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    .print\\:hidden { display: none !important; }
    .print\\:shadow-none { box-shadow: none !important; }
    .print\\:border-none { border: none !important; }
    .print\\:p-0 { padding: 0 !important; }
    .print\\:bg-white { background-color: white !important; }
    
    /* Ensure colors print correctly */
    * {
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
  }
`
