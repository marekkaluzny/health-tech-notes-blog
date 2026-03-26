---
title: FHIR structured data capture (SDC) in practice
date: 2026-03-23
tags:
  - FHIR
  - SDC
  - Healthcare Interoperability
  - Data Standards
---

One thing I keep seeing in healthcare projects, both in the UK and in Poland, is how often similar information is collected in slightly different ways. Each team has its own form, its own labels and its own logic. That usually leads to repeated data entry, avoidable mistakes, harder reporting and slower integration.

This is where FHIR Structured Data Capture, or FHIR SDC, comes in.

<!-- excerpt -->

## What is FHIR SDC?

FHIR SDC is an approach for designing, sharing and using structured healthcare forms in a consistent way.

At the core are two FHIR resources:
- `Questionnaire`, which defines the form
- `QuestionnaireResponse`, which stores the answers

Base FHIR already gives us those resources. SDC builds on them and adds guidance for richer form behaviour, pre-population, workflow context and better reuse of captured answers.

The simple idea is this: the form should not live only inside application code. It should exist as structured data that can be versioned, reviewed, reused and shared across systems.

### A simple example

```json
{
  "resourceType": "Questionnaire",
  "id": "initial-assessment",
  "url": "https://example.org/fhir/Questionnaire/initial-assessment",
  "version": "1.0.0",
  "status": "active",
  "title": "Initial Assessment",
  "item": [
    {
      "linkId": "nhs-number",
      "type": "string",
      "text": "NHS Number",
      "required": true,
      "maxLength": 10
    },
    {
      "linkId": "date-of-birth",
      "type": "date",
      "text": "Date of birth",
      "required": true
    },
    {
      "linkId": "smoking-status",
      "type": "choice",
      "text": "Smoking status",
      "required": false,
      "answerOption": [
        {
          "valueCoding": {
            "system": "http://snomed.info/sct",
            "code": "449868002",
            "display": "Current every day smoker"
          }
        },
        {
          "valueCoding": {
            "system": "http://snomed.info/sct",
            "code": "8517006",
            "display": "Ex-smoker"
          }
        },
        {
          "valueCoding": {
            "system": "http://snomed.info/sct",
            "code": "266919005",
            "display": "Never smoked tobacco"
          }
        }
      ]
    }
  ]
}
```

When a patient or clinician completes that form, the answers are stored in a `QuestionnaireResponse`:

```json
{
  "resourceType": "QuestionnaireResponse",
  "questionnaire": "https://example.org/fhir/Questionnaire/initial-assessment|1.0.0",
  "status": "completed",
  "subject": {
    "reference": "Patient/123"
  },
  "authored": "2026-03-24T10:15:00Z",
  "item": [
    {
      "linkId": "nhs-number",
      "answer": [
        {
          "valueString": "1234567890"
        }
      ]
    },
    {
      "linkId": "date-of-birth",
      "answer": [
        {
          "valueDate": "1988-04-12"
        }
      ]
    },
    {
      "linkId": "smoking-status",
      "answer": [
        {
          "valueCoding": {
            "system": "http://snomed.info/sct",
            "code": "266919005",
            "display": "Never smoked tobacco"
          }
        }
      ]
    }
  ]
}
```

It looks simple, but it makes a real difference. Once the form definition is structured and shared, different systems can work from the same definition instead of inventing their own version each time.

One practical detail is worth mentioning. Keep `item.linkId` stable across form versions, and where possible bind answers to agreed terminology such as SNOMED CT. That makes reporting, mapping, analytics and audit much easier later.

Another important point is that SDC is not only about rendering forms on screen. In a good implementation, captured answers can also support population or extraction into clinical resources such as `Observation`, `Condition` or `ServiceRequest`.

There is also an important engineering benefit here. If your form designer or renderer is built around shared `Questionnaire` resources, you can build it once and reuse it in many places. That is valuable for accessibility, consistency and delivery speed.

## What makes SDC useful in practice?

For technical teams, the value usually becomes clear fairly quickly.

- The form definition is separated from the UI implementation
- Validation rules sit closer to the data model
- Conditional form behaviour becomes easier to manage consistently
- Shared questionnaires reduce duplication between systems
- Structured responses are easier to reuse downstream

Reusable rendering is a big part of that value. If you invest time in making a renderer accessible, responsive and easy to maintain, that investment can support many forms instead of only one workflow.

You can also use the same questionnaire in different user experiences. A patient-facing renderer might focus on simple layout, mobile screens and plain language. A practitioner-facing renderer can present the same questionnaire in a way that works better on large screens, with denser layouts and more clinical context.

The same idea applies to advanced features. If one form needs a body map, signature capture or some other richer interaction, you can model that through questionnaire extensions and add support in the renderer once. After that, the same capability can be reused across other forms that need it.

For delivery leads and decision makers, the value looks a bit different, but it matters just as much.

- New workflows can be introduced with less custom build each time
- Governance becomes easier when form versions are visible and controlled
- Cross-system data reuse becomes more realistic
- Compliance discussions become simpler when structure and provenance are clearer
- Accessibility improvements can be reused across multiple journeys instead of rebuilt for each form

SDC does not solve interoperability on its own. You still need good terminology, governance, integration design and operational discipline. But it gives you a much stronger starting point than a collection of custom forms built separately in each system.

## Real-life situations where SDC helps

### Scenario 1: Multi-hospital data exchange

Imagine a healthcare network with several hospitals. Each site captures similar assessment data, but the structure of the forms is slightly different.

That creates a predictable set of problems:
- One hospital cannot easily compare its data with another
- Regional reporting needs extra mapping and transformation work
- Clinical pathways across sites become harder to standardize

If that network used shared SDC questionnaires for core assessments, the likely benefits would be:
- More consistent capture of key clinical data
- Less duplication in integration work
- Easier onboarding of new hospitals or partner systems

### Scenario 2: Cross-border care in Europe

Imagine a patient from Poland receiving treatment in another EU country. The data exists, but its structure is tied to local forms and local workflows.

That can lead to:
- Delays in understanding the patient record
- Manual translation of data fields
- Higher risk that the meaning of a data element is lost during exchange

With SDC-aligned forms and shared FHIR structures, you create a better starting point for cross-border interoperability. That matters even more in the context of EHDS, where semantic consistency matters just as much as technical transport.

In practice, that could mean:
- Cleaner exchange of structured patient information
- Better support for EHDS-style data sharing goals
- More confidence that information keeps the same meaning across systems

### Scenario 3: Analytics and machine learning readiness

Imagine a provider building models for readmission risk, early intervention or service planning. The first problem is often not the model. It is the quality and consistency of the input data.

If the same clinical concept is collected in five different ways, analytics teams spend their time cleaning and mapping instead of learning from the data.

This is where SDC can help. When core assessments are captured in a consistent structure, you get a better base for dashboards, analytics and machine learning.

In practice, that could mean:
- Less time spent normalizing form data
- Better consistency in analytical datasets
- More trust in outputs because the source structure is clearer

## What happens without SDC?

Without a structured approach to forms, organizations often end up with the same problems again and again.

### 1. **Form proliferation and local workarounds**

Departments create their own forms for similar needs. Over time, this creates duplication, inconsistent field definitions and hidden local logic.

### 2. **Poorer data quality at the point of capture**

If validation rules are inconsistent or missing, data quality problems are pushed downstream. Reporting, integration and analytics teams then have to clean the data later.

### 3. **More expensive interoperability**

When each form is designed differently, interoperability becomes a mapping exercise for every project. That increases delivery time and long-term maintenance cost.

### 4. **Slower change across the organization**

Even small workflow changes can require updates in multiple places. That makes it harder to scale new services, pathways or reporting requirements.

### 5. **Weaker governance and auditability**

If form definitions are not managed properly, it becomes harder to answer basic questions such as which version was used, who approved it and how answers should be interpreted.

## In summary

FHIR SDC is not just about digital forms. It is about creating a more reliable way to define, capture and reuse structured healthcare information.

For teams working in NHS-related environments, Polish healthcare or broader European interoperability work, that matters more every year. EHDS, integration pressures, analytics needs and operational scale all push in the same direction: better structure at the point of capture.

SDC will not remove every integration challenge. But it can remove a lot of unnecessary variation and that is often where real progress starts.

## Let's talk

If this is close to the work you are doing, feel free to get in touch.
