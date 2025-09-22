# Abada Engine API Documentation

This document provides a detailed overview of the Abada Engine REST API endpoints.

---

## Root Controller

### GET /v1

- **Description:** Returns a welcome message to the Abada Engine API.
- **Responses:**
  - `200 OK`
    ```json
    {
      "message": "Welcome to Abada Engine API"
    }
    ```

---

## Info Controller

### GET /v1/info

- **Description:** Provides information about the running Abada Engine instance.
- **Responses:**
  - `200 OK`
    ```json
    {
      "status": "UP",
      "engineVersion": "0.8.2-alpha",
      "bpmnSupport": "BPMN model Validation"
    }
    ```

---

## Process Controller

### POST /v1/processes/deploy

- **Description:** Deploys a new BPMN process definition.
- **Request:**
  - `Content-Type`: `multipart/form-data`
  - `file`: The BPMN file to be deployed.
- **Responses:**
  - `200 OK`: with the message "Deployed".

### GET /v1/processes

- **Description:** Retrieves a list of all deployed process definitions.
- **Responses:**
  - `200 OK`
    ```json
    [
      {
        "id": "process_1",
        "name": "My Process",
        "documentation": "A simple process"
      }
    ]
    ```

### POST /v1/processes/start

- **Description:** Starts a new instance of a deployed process.
- **Request:**
  - `processId`: The ID of the process to start.
- **Responses:**
  - `200 OK`: with a message indicating the started instance ID.

### GET /v1/processes/instances

- **Description:** Retrieves a list of all process instances.
- **Responses:**
  - `200 OK`
    ```json
    [
      {
        "id": "instance_123",
        "currentActivityId": "user_task_1",
        "variables": {
          "orderId": "order_456"
        },
        "waitingForUserTask": true,
        "isCompleted": false
      }
    ]
    ```

### GET /v1/processes/instance/{id}

- **Description:** Retrieves a specific process instance by its ID.
- **Parameters:**
  - `id` (path variable): The ID of the process instance.
- **Responses:**
  - `200 OK`
    ```json
    {
      "id": "instance_123",
      "currentActivityId": "user_task_1",
      "variables": {
        "orderId": "order_456"
      },
      "waitingForUserTask": true,
      "isCompleted": false
    }
    ```
  - `404 Not Found`

### GET /v1/processes/{id}

- **Description:** Retrieves a specific process definition by its ID, including the BPMN XML.
- **Parameters:**
  - `id` (path variable): The ID of the process definition.
- **Responses:**
  - `200 OK`
    ```json
    {
      "id": "process_1",
      "name": "My Process",
      "bpmnXml": "..."
    }
    ```
  - `404 Not Found`

---

## Task Controller

### GET /v1/tasks

- **Description:** Retrieves a list of tasks visible to the current user.
- **Responses:**
  - `200 OK`
    ```json
    [
      {
        "id": "task_789",
        "taskDefinitionKey": "user_task_1",
        "name": "Review Order",
        "assignee": "patrick",
        "candidateUsers": [],
        "candidateGroups": ["managers"],
        "processInstanceId": "instance_123"
      }
    ]
    ```

### GET /v1/tasks/{id}

- **Description:** Retrieves the details of a specific task by its ID, including process variables.
- **Parameters:**
  - `id` (path variable): The ID of the task.
- **Responses:**
  - `200 OK`
    ```json
    {
      "id": "task_789",
      "taskDefinitionKey": "user_task_1",
      "name": "Review Order",
      "assignee": "patrick",
      "candidateUsers": [],
      "candidateGroups": ["managers"],
      "processInstanceId": "instance_123",
      "variables": {
        "orderId": "order_456",
        "amount": 100.0
      }
    }
    ```
  - `404 Not Found`

### POST /v1/tasks/claim

- **Description:** Claims a task for the current user.
- **Request:**
  - `taskId`: The ID of the task to claim.
- **Responses:**
  - `200 OK`: with the message "Claimed".
  - `400 Bad Request`: if the task cannot be claimed.

### POST /v1/tasks/complete

- **Description:** Completes a task.
- **Request:**
  - `taskId`: The ID of the task to complete.
  - `variables` (optional request body):
    ```json
    {
      "approved": true
    }
    ```
- **Responses:**
  - `200 OK`: with the message "Completed".
  - `400 Bad Request`: if the task cannot be completed.

---

## Event Controller

### POST /v1/events/messages

- **Description:** Correlates a message event to a waiting process instance.
- **Request Body:**
  ```json
  {
    "messageName": "order_shipped",
    "correlationKey": "order_456",
    "variables": {
      "shippingDate": "2024-01-01T12:00:00Z"
    }
  }
  ```
- **Responses:**
  - `202 Accepted`

### POST /v1/events/signals

- **Description:** Broadcasts a signal event to all waiting process instances.
- **Request Body:**
  ```json
  {
    "signalName": "system_maintenance",
    "variables": {
      "maintenanceWindow": "2 hours"
    }
  }
  ```
- **Responses:**
  - `202 Accepted`

---

## External Task Controller

### POST /v1/external-tasks/fetch-and-lock

- **Description:** Fetches and locks available external tasks for a given set of topics.
- **Request Body:**
  ```json
  {
    "workerId": "worker_abc",
    "topics": ["charge_credit_card"],
    "lockDuration": 60000
  }
  ```
- **Responses:**
  - `200 OK`
    ```json
    [
      {
        "id": "external_task_xyz",
        "topicName": "charge_credit_card",
        "variables": {
          "orderId": "order_456",
          "amount": 100.0
        }
      }
    ]
    ```

### POST /v1/external-tasks/{id}/complete

- **Description:** Completes an external task and resumes the corresponding process instance.
- **Parameters:**
  - `id` (path variable): The unique ID of the external task to complete.
- **Request Body:**
  ```json
  {
    "paymentTransactionId": "txn_12345"
  }
  ```
- **Responses:**
  - `200 OK`
