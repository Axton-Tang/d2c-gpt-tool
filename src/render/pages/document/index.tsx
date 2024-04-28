import React, { useState } from "react";
import { Card } from "antd";
import "./index.less";
import { useNavigate } from "react-router-dom";
import { pdfjs, Document as PDFDocument, Page } from 'react-pdf';
import file from './D2C 工作流指导.pdf'

// 设置 Worker 的路径到公共CDN
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/legacy/build/pdf.worker.min.js`;

function Document() {

  const [numPages, setNumPages] = useState(0);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
  }

  return (
    <div>
      <Card bordered={false}>
        <PDFDocument file={file} onLoadSuccess={onDocumentLoadSuccess}>
          {Array.from(
            new Array(numPages),
            (el, index) => (
              <Page
                key={`page_${index + 1}`}
                pageNumber={index + 1}
                renderTextLayer={false}
                renderAnnotationLayer={false}
              />
            ),
          )}
        </PDFDocument>
      </Card>
    </div>
  );
}

export default Document;
