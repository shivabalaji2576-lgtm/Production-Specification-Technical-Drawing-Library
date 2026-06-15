import React from 'react';
import { CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';

const ComplianceBadge = ({ status }) => {
  if (status === 'Passed') {
    return (
      <span className="badge badge-pass">
        <CheckCircle2 className="w-3.5 h-3.5" /> Passed
      </span>
    );
  }
  if (status === 'Warning') {
    return (
      <span className="badge badge-warn">
        <AlertTriangle className="w-3.5 h-3.5" /> Warning
      </span>
    );
  }
  return (
    <span className="badge badge-fail">
      <XCircle className="w-3.5 h-3.5" /> Failure
    </span>
  );
};

export default ComplianceBadge;
