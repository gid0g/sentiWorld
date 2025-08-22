import React from 'react';
import { Toast as BootstrapToast } from 'react-bootstrap';
import { CheckCircle2, XCircle } from 'lucide-react';

const Toast = ({ show, message, type = 'success', onClose }) => {
  const isSuccess = type === 'success';
  
  const bgColor = isSuccess ? 'bg-success' : 'bg-danger';
  const icon = isSuccess ? <CheckCircle2 size={20} /> : <XCircle size={20} />;

  return (
    <div
      style={{
        position: 'fixed',
        top: 20,
        right: 20,
        zIndex: 9999,
      }}
    >
      <BootstrapToast 
        show={show} 
        onClose={onClose}
        delay={3000}
        autohide
        className={`${bgColor} text-white`}
      >
        <BootstrapToast.Body className="d-flex align-items-center gap-2">
          {icon}
          {message}
        </BootstrapToast.Body>
      </BootstrapToast>
    </div>
  );
};

export default Toast; 