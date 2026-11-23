import React, { useState } from "react";
import { StatusBadge } from "./StatusBadge";
import { EmptyState } from "./EmptyState";
import {
  ClipboardListIcon,
  PlusIcon,
  TrashIcon,
  CheckCircleIcon,
  ClockIcon,
  ArrowRightIcon
} from "./Icons";

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
  requestLoading = false,
  requestMessage = "",
  requestError = "",
  defaultTab = "list"
}) => {
  const [activeTab, setActiveTab] = useState(
    userRole === "REQUESTER" && defaultTab === "create" ? "create" : "list"
  );

  return (
    <div className="request-view-flow animate-fadeIn">

      {/* HEADER */}
      <div className="view-header">
        <div>
          <h2 className="view-title">
            {userRole === "SUPERVISOR"
              ? "Requisition Approvals & Review"
              : "Support Requisition Management"}
          </h2>

          <p className="view-subtitle">
            {userRole === "SUPERVISOR"
              ? "Review submitted staff equipment requests and monitor requisition statuses"
              : "Draft multi-item supply requests and submit them for supervisor authorization"}
          </p>
        </div>

        {userRole === "REQUESTER" && activeTab !== "create" && (
          <button
            type="button"
            className="btn-primary"
            onClick={() => setActiveTab("create")}
          >
            <PlusIcon size={16} />
            <span>+ New Requisition</span>
          </button>
        )}
      </div>

      {/* TABS FOR REQUESTER */}
      {userRole === "REQUESTER" && (
        <div className="stock-tabs-nav">
          <button
            type="button"
            className={`stock-tab-btn ${
              activeTab === "list" ? "active" : ""
            }`}
            onClick={() => setActiveTab("list")}
          >
            <ClipboardListIcon size={17} />
            <span>My Requisitions</span>
            <span className="tab-count-pill">{requests.length}</span>
          </button>

          <button
            type="button"
            className={`stock-tab-btn ${
              activeTab === "create" ? "active" : ""
            }`}
            onClick={() => setActiveTab("create")}
          >
            <PlusIcon size={17} />
            <span>Create Requisition</span>
          </button>
        </div>
      )}

      {/* CREATE REQUEST BUILDER */}
      {activeTab === "create" && userRole === "REQUESTER" && (
        <div className="panel-card form-panel-card animate-fadeIn">

          <div className="panel-header">
            <div>
              <h3 className="panel-title">Create New Requisition</h3>
              <p className="panel-subtitle">
                Select the required items and quantities.
              </p>
            </div>
          </div>

          <div className="request-lines-container">
            {requestLines.map((line, index) => (
              <div className="request-line-row" key={index}>

                <div className="form-group">
                  <label>Item</label>

                  <select
                    value={line.item_id}
                    onChange={(e) =>
                      onRequestLineChange(
                        index,
                        "item_id",
                        e.target.value
                      )
                    }
                  >
                    <option value="">Select item</option>

                    {items.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.code} - {item.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Quantity</label>

                  <input
                    type="number"
                    min="1"
                    value={line.requested_qty}
                    onChange={(e) =>
                      onRequestLineChange(
                        index,
                        "requested_qty",
                        e.target.value
                      )
                    }
                    placeholder="Enter quantity"
                  />
                </div>

                {requestLines.length > 1 && (
                  <button
                    type="button"
                    className="btn-icon-danger"
                    onClick={() => onRemoveRequestLine(index)}
                    title="Remove item"
                  >
                    <TrashIcon size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="request-builder-actions">

            <button
              type="button"
              className="btn-secondary"
              onClick={onAddRequestLine}
            >
              <PlusIcon size={16} />
              Add Another Item
            </button>

            <button
              type="button"
              className="btn-primary"
              onClick={onCreateRequest}
              disabled={requestLoading}
            >
              {requestLoading ? "Creating..." : "Create Requisition"}
            </button>

          </div>

          {requestMessage && (
            <div className="success-message">
              {requestMessage}
            </div>
          )}

          {requestError && (
            <div className="error-message">
              {requestError}
            </div>
          )}

        </div>
      )}

      {/* REQUESTS LIST */}
      {activeTab === "list" && (
        <div className="panel-card table-responsive animate-fadeIn">

          <div className="panel-header">
            <div>
              <h3 className="panel-title">
                {userRole === "SUPERVISOR"
                  ? "Submitted Requisitions"
                  : "My Requisitions"}
              </h3>

              <p className="panel-subtitle">
                {userRole === "SUPERVISOR"
                  ? "Review and authorize submitted requests."
                  : "Track your requisition requests and approval status."}
              </p>
            </div>
          </div>

          <table className="portal-table">

            <thead>
              <tr>
                <th>Request ID</th>
                <th>Item Specification</th>
                <th>Requested Qty</th>
                <th>Current Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>

              {requests.length === 0 ? (
                <tr>
                  <td colSpan="5">
                    <EmptyState
                      icon={<ClipboardListIcon size={28} />}
                      title="No requisitions found"
                      message={
                        userRole === "SUPERVISOR"
                          ? "There are no submitted requisitions awaiting review."
                          : "You have not created any requisitions yet."
                      }
                    />
                  </td>
                </tr>
              ) : (

                requests.map((request) => (

                  <tr key={request.line_id || request.id}>

                    <td className="font-mono font-medium">
                      #{request.id}
                    </td>

                    <td className="font-medium">
                      {request.item_code} - {request.item_name}
                    </td>

                    <td>
                      {request.requested_qty} units
                    </td>

                    <td>
                      <StatusBadge status={request.status} />
                    </td>

                    <td>

                      {/* REQUESTER ACTION */}
                      {userRole === "REQUESTER" &&
                        request.status === "DRAFT" && (

                          <button
                            type="button"
                            className="btn-table-action action-submit"
                            onClick={() =>
                              onSubmitRequest(request.id)
                            }
                            title="Submit draft request for supervisor approval"
                          >
                            Submit
                          </button>
                        )}

                      {/* SUPERVISOR ACTION */}
                      {userRole === "SUPERVISOR" &&
                        request.status === "SUBMITTED" && (

                          <div className="request-action-group">

                            <button
                              type="button"
                              className="btn-table-action action-approve"
                              onClick={() =>
                                onApproveRequest(request.id)
                              }
                              title="Approve requisition"
                            >
                              <CheckCircleIcon size={15} />
                              Approve
                            </button>

                            <button
                              type="button"
                              className="btn-table-action action-reject"
                              onClick={() =>
                                onRejectRequest(request.id)
                              }
                              title="Reject requisition"
                            >
                              Reject
                            </button>

                          </div>
                        )}

                      {/* STATUS TEXT */}
                      {(
                        (userRole === "REQUESTER" &&
                          request.status !== "DRAFT") ||
                        (userRole === "SUPERVISOR" &&
                          request.status !== "SUBMITTED")
                      ) && (

                        <span className="text-secondary text-sm">

                          {request.status === "SUBMITTED"
                            ? "Awaiting Review"
                            : request.status === "APPROVED"
                            ? "Ready for Issue"
                            : request.status === "REJECTED"
                            ? "Rejected"
                            : request.status === "ISSUED"
                            ? "Issued"
                            : request.status === "CLOSED"
                            ? "Closed"
                            : "Processed"}

                        </span>
                      )}

                    </td>

                  </tr>

                ))

              )}

            </tbody>

          </table>

        </div>
      )}

    </div>
  );
};