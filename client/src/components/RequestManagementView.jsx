import { useState } from "react";
import { StatusBadge } from "./StatusBadge";
import { EmptyState } from "./EmptyState";
import { ClipboardListIcon, PlusIcon, TrashIcon } from "./Icons";

const VerificationRow = ({ label, passed }) => (
  <div className={`review-check ${passed ? "is-valid" : "is-invalid"}`}>
    <span aria-hidden="true">{passed ? "✓" : "!"}</span>
    <span>{label}</span>
    <strong>{passed ? "Verified" : "Check required"}</strong>
  </div>
);

export const RequestManagementView = ({
  userRole,
  items = [],
  requests = [],
  requestLines = [],
  onRequestLineChange,
  onAddRequestLine,
  onRemoveRequestLine,
  onCreateRequest,
  onSubmitRequest,
  onApproveRequest,
  onRejectRequest,
  onRequestClarification,
  onLoadRequestReview,
  requestReview,
  requestReviewLoading = false,
  requestLoading = false,
  requestMessage = "",
  requestError = "",
  defaultTab = "list"
}) => {
  const [activeTab, setActiveTab] = useState(userRole === "REQUESTER" && defaultTab === "create" ? "create" : "list");
  const [purpose, setPurpose] = useState("");
  const [expectedReturnDate, setExpectedReturnDate] = useState("");

  const submitDecision = (requestId, decision) => {
    if (decision === "approve") {
      const note = window.prompt("Approval note (optional):", "Approved after requester and stock review");
      if (note !== null) onApproveRequest(requestId, note.trim() || "Approved by supervisor");
      return;
    }
    const reason = window.prompt("Enter the reason for rejection:");
    if (reason === null) return;
    if (!reason.trim()) {
      window.alert("A rejection reason is required.");
      return;
    }
    onRejectRequest(requestId, reason.trim());
  };

  const requestClarification = (requestId) => {
    const message = window.prompt("What clarification is needed?");
    if (message?.trim()) onRequestClarification(requestId, message.trim());
  };

  return (
    <main className="request-view-flow animate-fadeIn">
      <header className="view-header">
        <div>
          <h2 className="view-title">{userRole === "SUPERVISOR" ? "Requisition Approvals & Review" : "Support Requisition Management"}</h2>
          <p className="view-subtitle">{userRole === "SUPERVISOR" ? "Review verified requester identity, accountability, and stock before deciding." : "Create and track support equipment requests."}</p>
        </div>
        {userRole === "REQUESTER" && activeTab !== "create" && <button type="button" className="btn-primary" onClick={() => setActiveTab("create")}><PlusIcon size={16} /> New Requisition</button>}
      </header>

      {userRole === "REQUESTER" && <div className="stock-tabs-nav">
        <button type="button" className={`stock-tab-btn ${activeTab === "list" ? "active" : ""}`} onClick={() => setActiveTab("list")}><ClipboardListIcon size={17} /> My Requisitions <span className="tab-count-pill">{requests.length}</span></button>
        <button type="button" className={`stock-tab-btn ${activeTab === "create" ? "active" : ""}`} onClick={() => setActiveTab("create")}><PlusIcon size={17} /> Create Requisition</button>
      </div>}

      {activeTab === "create" && userRole === "REQUESTER" && <section className="panel-card form-panel-card animate-fadeIn">
        <div className="panel-header"><div><h3 className="panel-title">Create New Requisition</h3><p className="panel-subtitle">Your employee identity and authorized category are taken from your account.</p></div></div>
        <div className="request-review-fields">
          <label className="form-group">Purpose<textarea value={purpose} onChange={(event) => setPurpose(event.target.value)} maxLength={1000} required placeholder="Describe the work or operational need" /></label>
          <label className="form-group">Expected return date<input type="date" value={expectedReturnDate} onChange={(event) => setExpectedReturnDate(event.target.value)} required /></label>
        </div>
        <div className="request-lines-container">{requestLines.map((line, index) => <div className="request-line-row" key={index}>
          <label className="form-group">Item<select value={line.item_id} onChange={(event) => onRequestLineChange(index, "item_id", event.target.value)}><option value="">Select item</option>{items.map((item) => <option key={item.id} value={item.id}>{item.code} - {item.name}</option>)}</select></label>
          <label className="form-group">Quantity<input type="number" min="1" step="1" value={line.requested_qty} onChange={(event) => onRequestLineChange(index, "requested_qty", event.target.value)} placeholder="Enter quantity" /></label>
          {requestLines.length > 1 && <button type="button" className="btn-icon-danger" onClick={() => onRemoveRequestLine(index)} aria-label="Remove item"><TrashIcon size={16} /></button>}
        </div>)}</div>
        <div className="request-builder-actions"><button type="button" className="btn-secondary" onClick={onAddRequestLine}><PlusIcon size={16} /> Add Another Item</button><button type="button" className="btn-primary" onClick={() => onCreateRequest({ purpose, expectedReturnDate })} disabled={requestLoading}>{requestLoading ? "Creating..." : "Create Requisition"}</button></div>
        {requestMessage && <div className="success-message" role="status">{requestMessage}</div>}{requestError && <div className="error-message" role="alert">{requestError}</div>}
      </section>}

      {activeTab === "list" && <section className="panel-card table-responsive animate-fadeIn">
        <div className="panel-header"><div><h3 className="panel-title">{userRole === "SUPERVISOR" ? "Submitted Requisitions" : "My Requisitions"}</h3><p className="panel-subtitle">{userRole === "SUPERVISOR" ? "Open a dossier for evidence before recording a decision." : "Track your requests and approval status."}</p></div></div>
        <table className="portal-table"><thead><tr><th>Request ID</th>{userRole === "SUPERVISOR" && <><th>Employee ID</th><th>Requester</th></>}<th>Item</th><th>Qty</th><th>Status</th><th>Action</th></tr></thead>
          <tbody>{requests.length === 0 ? <tr><td colSpan={userRole === "SUPERVISOR" ? 7 : 5}><EmptyState icon={<ClipboardListIcon size={28} />} title="No requisitions found" message={userRole === "SUPERVISOR" ? "There are no requests awaiting review." : "You have not created any requisitions yet."} /></td></tr> : requests.map((request) => <tr key={request.line_id || request.id}>
            <td className="font-mono font-medium">#{request.id}</td>{userRole === "SUPERVISOR" && <><td>{request.employee_id || "—"}</td><td>{request.requester_name || "—"}<small className="review-table-subtitle">{request.department || ""}</small></td></>}
            <td className="font-medium">{request.item_code} - {request.item_name}</td><td>{request.requested_qty} units</td><td><StatusBadge status={request.status} /></td><td>
              {userRole === "REQUESTER" && request.status === "DRAFT" && <button type="button" className="btn-table-action action-submit" onClick={() => onSubmitRequest(request.id)}>Submit</button>}
              {userRole === "SUPERVISOR" && request.status === "SUBMITTED" && <button type="button" className="btn-table-action action-submit" onClick={() => onLoadRequestReview(request.id)}>Review dossier</button>}
              {userRole === "SUPERVISOR" && request.status !== "SUBMITTED" && <span className="text-secondary text-sm">{request.status}</span>}
              {userRole === "REQUESTER" && request.status !== "DRAFT" && <span className="text-secondary text-sm">{request.status}</span>}
            </td>
          </tr>)}</tbody></table>
      </section>}

      {userRole === "SUPERVISOR" && requestReviewLoading && <div className="panel-card" role="status">Loading requester review dossier…</div>}
      {userRole === "SUPERVISOR" && requestReview && <section className="panel-card request-dossier" aria-labelledby="request-dossier-title">
        <div className="request-dossier-heading"><div><span className="request-dossier-eyebrow">Supervisor evidence review</span><h3 id="request-dossier-title">Request #{requestReview.request.id}</h3></div><StatusBadge status={requestReview.request.status} /></div>
        <div className="request-dossier-grid">
          <article className="request-dossier-card"><h4>Requester identity</h4><dl><div><dt>Employee ID</dt><dd>{requestReview.requester.employeeId}</dd></div><div><dt>Name</dt><dd>{requestReview.requester.name}</dd></div><div><dt>Department</dt><dd>{requestReview.requester.department}</dd></div><div><dt>Designation</dt><dd>{requestReview.requester.designation || "—"}</dd></div><div><dt>Role / account</dt><dd>{requestReview.requester.role} / {requestReview.requester.active ? "ACTIVE" : "INACTIVE"}</dd></div><div><dt>Authorized category</dt><dd>{requestReview.requester.authorizedCategory}</dd></div></dl></article>
          <article className="request-dossier-card"><h4>Requester verification</h4><div className="request-check-list"><VerificationRow label="Employee exists" passed={requestReview.verification.employeeExists} /><VerificationRow label="Account active" passed={requestReview.verification.accountActive} /><VerificationRow label="Department verified" passed={requestReview.verification.departmentValid} /><VerificationRow label="Requester role" passed={requestReview.verification.roleValid} /><VerificationRow label="Category authorized" passed={requestReview.verification.categoryAuthorized} /></div><p className="request-dossier-note">Status: {requestReview.verification.status || "NOT VERIFIED"}</p></article>
        </div>
        <article className="request-dossier-card request-dossier-wide"><h4>Request details</h4><p><strong>Purpose:</strong> {requestReview.request.purpose || "Not provided"}</p><p><strong>Expected return:</strong> {requestReview.request.expectedReturnDate ? new Date(requestReview.request.expectedReturnDate).toLocaleDateString() : "—"}</p><div className="table-responsive"><table className="portal-table"><thead><tr><th>Item</th><th>Authorized category</th><th>Qty</th><th>Available</th><th>Minimum</th></tr></thead><tbody>{requestReview.request.lines.map((line) => <tr key={line.lineId}><td>{line.itemCode} — {line.itemName}</td><td>{line.category}</td><td>{line.requestedQuantity}</td><td>{line.availableStock}</td><td>{line.minimumStock}</td></tr>)}</tbody></table></div></article>
        <div className="request-dossier-grid">
          <article className="request-dossier-card"><h4>Request history <span className="request-dossier-count">{requestReview.history.counts.total || 0} total</span></h4><p className="request-dossier-note">Pending {requestReview.history.counts.pending || 0} · Approved {requestReview.history.counts.approved || 0} · Rejected {requestReview.history.counts.rejected || 0} · Issued {requestReview.history.counts.issued || 0} · Closed {requestReview.history.counts.closed || 0}</p><div className="table-responsive"><table className="portal-table"><thead><tr><th>Request</th><th>Item</th><th>Qty</th><th>Status</th></tr></thead><tbody>{requestReview.history.requests.map((row, index) => <tr key={`${row.id}-${index}`}><td>#{row.id}</td><td>{row.item_name}</td><td>{row.requested_qty}</td><td>{row.status}</td></tr>)}</tbody></table></div></article>
          <article className="request-dossier-card"><h4>Current assets & accountability</h4><p>Issued: {requestReview.accountability.currently_issued || 0} · Outstanding: {requestReview.accountability.outstanding_returns || 0} · Late: {requestReview.accountability.late_returns || 0} · Damaged: {requestReview.accountability.damaged_assets || 0}</p>{requestReview.assets.length ? <ul className="request-asset-list">{requestReview.assets.map((asset) => <li key={asset.id}><strong>{asset.item_name}</strong><span>{asset.category} · {asset.status} · Due {asset.expected_return_date ? new Date(asset.expected_return_date).toLocaleDateString() : "—"}</span></li>)}</ul> : <p className="request-dossier-note">No recorded asset assignments.</p>}</article>
        </div>
        <article className="request-dossier-card request-dossier-wide"><h4>Validation & decision support</h4><div className="request-check-list"><VerificationRow label="Submitted workflow state" passed={requestReview.validation.requestSubmitted} /><VerificationRow label="Requester verification" passed={requestReview.validation.requesterVerified} /><VerificationRow label="Authorized items and quantities" passed={requestReview.validation.categoryAuthorized && requestReview.validation.quantityValid} /><VerificationRow label="Requested stock available" passed={requestReview.validation.stockAvailable} /></div>{requestReview.warnings.length > 0 && <div className="request-warning-list"><strong>Warnings for supervisor consideration</strong>{requestReview.warnings.map((warning) => <p key={warning}>{warning}</p>)}</div>}</article>
        {requestReview.request.status === "SUBMITTED" && <div className="request-dossier-actions"><button type="button" className="btn-table-action action-approve" onClick={() => submitDecision(requestReview.request.id, "approve")}>Approve request</button><button type="button" className="btn-table-action action-reject" onClick={() => submitDecision(requestReview.request.id, "reject")}>Reject request</button><button type="button" className="btn-secondary" onClick={() => requestClarification(requestReview.request.id)}>Request clarification</button></div>}
      </section>}
    </main>
  );
};
