# Delivery AI Integration - AgriConnect

## Overview
AI-powered Logistics and Compliance Manager integrated into the Delivery Man portal using Google Gemini 2.5 Flash API.

## AI Persona
**Role:** Hyper-efficient Logistics and Compliance Manager

**Capabilities:**
- Real-time route adjustments
- Cold-chain SOP retrieval
- Compliance logging assistance
- Temperature deviation flagging
- Drop-off rules guidance
- Delivery issue resolution

**Tone:** Concise, accurate, focused on maximizing delivery speed and compliance

---

## AI Functions Implemented

### 1. Cold-Chain Compliance Check
**Function:** `checkColdChainCompliance(productType, currentTemperature, duration)`

**Purpose:** Validates temperature requirements for perishable goods

**Input:**
- Product type (e.g., "organic poultry", "dairy", "vegetables")
- Current temperature (°C)
- Duration at temperature (minutes)

**Output:**
```typescript
{
  isCompliant: boolean,
  maxTemperature: number,
  minTemperature: number,
  recommendation: string,
  action: "accept" | "reject" | "monitor",
  reasoning: string
}
```

**Example Query:**
> "I am picking up organic poultry. What is the maximum acceptable temperature deviation for the refrigerated unit before I reject the load?"

**Use Case:** Before accepting a pickup, delivery personnel can verify if the product temperature is within acceptable range.

---

### 2. Route Optimization
**Function:** `getRouteOptimization(pickupAddress, deliveryAddress, currentLocation?, trafficConditions?)`

**Purpose:** Provides optimal route suggestions with time estimates

**Input:**
- Pickup address
- Delivery address
- Current location (optional)
- Traffic conditions (optional)

**Output:**
```typescript
{
  estimatedTime: string,
  distance: string,
  routeSuggestion: string,
  alternativeRoutes: Array<{
    route: string,
    time: string,
    notes: string
  }>,
  warnings: string[]
}
```

**Example Query:**
> "What's the fastest route from 123 Farm Road to 456 Main Street?"

**Use Case:** Real-time route planning with traffic considerations and alternative options.

---

### 3. Handling Instructions
**Function:** `getHandlingInstructions(productType, quantity, specialNotes?)`

**Purpose:** Provides product-specific handling procedures

**Input:**
- Product type
- Quantity (kg)
- Special notes (optional)

**Output:**
```typescript
{
  handlingSteps: string[],
  packagingRequirements: string[],
  temperatureRequirements: string,
  safetyPrecautions: string[],
  estimatedHandlingTime: string
}
```

**Example Query:**
> "How should I handle 50kg of organic tomatoes?"

**Use Case:** Ensures proper handling procedures for different product types.

---

### 4. Delivery Issue Resolution
**Function:** `resolveDeliveryIssue(issueType, issueDescription, deliveryDetails)`

**Purpose:** Provides immediate solutions for delivery problems

**Input:**
- Issue type (e.g., "customer not available", "address incorrect")
- Issue description
- Delivery details (product, customer, address)

**Output:**
```typescript
{
  solution: string,
  steps: string[],
  escalate: boolean,
  contactInfo: string,
  documentation: string[]
}
```

**Example Query:**
> "Customer is not at the delivery address. What should I do?"

**Use Case:** Quick problem-solving guidance during active deliveries.

---

### 5. SOP Retrieval
**Function:** `getSOPInstructions(topic)`

**Purpose:** Instant access to Standard Operating Procedures

**Input:**
- Topic (e.g., "cold chain management", "delivery procedures", "safety protocols")

**Output:**
```typescript
{
  title: string,
  steps: string[],
  keyPoints: string[],
  references: string[]
}
```

**Example Query:**
> "What's the SOP for handling refrigerated products?"

**Use Case:** Quick reference to company policies and procedures.

---

### 6. Compliance Logging
**Function:** `generateComplianceLog(deliveryData)`

**Purpose:** Automated compliance documentation and deviation flagging

**Input:**
- Order ID
- Product name
- Pickup/delivery times
- Temperature readings
- Issues encountered

**Output:**
```typescript
{
  logSummary: string,
  flaggedItems: Array<{
    item: string,
    severity: "low" | "medium" | "high",
    reason: string
  }>,
  complianceScore: number,
  recommendations: string[]
}
```

**Use Case:** End-of-delivery compliance reporting and quality assurance.

---

### 7. General Chat Assistant
**Function:** `chatWithDeliveryAssistant(message, context?)`

**Purpose:** Natural language interaction for any logistics question

**Input:**
- User message
- Optional context (order ID, product, status)

**Output:** AI-generated response based on delivery context

**Example Queries:**
- "What temperature should I maintain for dairy products?"
- "How do I document a damaged package?"
- "What's the protocol for late deliveries?"

---

## UI Component: DeliveryAIChatbot

### Features
- **Floating Chat Button:** Always accessible from bottom-right corner
- **Quick Actions:** One-click access to common functions
  - 🌡️ Temperature Check
  - 🗺️ Route Optimization
  - 📦 Handling Instructions
  - 📋 SOP Retrieval
- **Context-Aware:** Automatically includes current delivery information
- **Real-time Responses:** Powered by Gemini 2.5 Flash API
- **Message History:** Maintains conversation context

### Integration Points
- **DeliveryDashboard:** General logistics assistance
- **AssignedDeliveries:** Context-aware with current delivery details

### Quick Actions
```typescript
// Temperature Compliance
<button onClick={() => handleQuickAction('Check cold-chain compliance')}>
  <Thermometer /> Temperature
</button>

// Route Optimization
<button onClick={() => handleQuickAction('Optimize route')}>
  <Route /> Route
</button>

// Handling Instructions
<button onClick={() => handleQuickAction('Get handling instructions')}>
  <Package /> Handling
</button>

// SOP Retrieval
<button onClick={() => handleQuickAction('View SOP')}>
  <FileText /> SOP
</button>
```

---

## API Configuration

### Gemini API Setup
```typescript
const GEMINI_API_KEY = "AIzaSyCXUfFGgCS3yDFiLzjcXSiTlh-vIzZ9sd0";
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent";
```

### System Instruction
```typescript
delivery_man: {
  text: "Act as a hyper-efficient Logistics and Compliance Manager. Your primary duty is to provide real-time route adjustments, instantly retrieve specific cold-chain SOPs or drop-off rules, and assist with compliance logging by summarizing data points and flagging deviations. Your tone must be concise, accurate, and focused on maximizing delivery speed and compliance. Provide actionable answers for temperature control, handling procedures, route optimization, and regulatory compliance."
}
```

### Google Search Integration
All delivery AI functions have `enableSearch: true` to access real-time information about:
- Current traffic conditions
- Weather impacts on delivery
- Regulatory compliance standards
- Cold-chain best practices
- Food safety guidelines

---

## Example Use Cases

### Scenario 1: Pre-Pickup Temperature Check
**Delivery Person:** "I'm picking up organic chicken. The cooler shows 5°C. Is this acceptable?"

**AI Response:**
```
Cold-Chain Compliance Check

Product: organic chicken
Status: ❌ Non-Compliant
Temperature Range: 0°C - 4°C
Action: REJECT

Recommendation: The temperature is above the maximum acceptable range for poultry. Request the farmer to lower the temperature to 4°C or below before accepting the load.

Reasoning: Poultry must be maintained at 4°C or below to prevent bacterial growth and ensure food safety compliance.
```

### Scenario 2: Route Planning
**Delivery Person:** "Best route from Green Valley Farm to Downtown Market?"

**AI Response:**
```
Route Optimization

📍 Distance: 18 km
⏱️ Estimated Time: 25-30 minutes

Recommended Route:
Take Highway 101 South for 12km, exit at Market Street, continue 6km to destination. This route avoids downtown traffic and has minimal stops.

⚠️ Warnings:
• Construction on Main Street - avoid between 8am-5pm
• School zone on Market Street - reduce speed 7am-9am
```

### Scenario 3: Handling Instructions
**Delivery Person:** "How do I handle 30kg of leafy greens?"

**AI Response:**
```
Handling Instructions: leafy greens

⏱️ Estimated Time: 8-12 minutes
🌡️ Temperature: Keep refrigerated at 1-4°C

Steps:
1. Inspect leaves for damage or wilting
2. Verify quantity and packaging integrity
3. Use clean, sanitized containers
4. Stack carefully to avoid crushing
5. Maintain cold chain throughout transport

Safety Precautions:
• Wear clean gloves when handling
• Avoid cross-contamination with other products
• Keep away from direct sunlight
```

---

## Benefits

### For Delivery Personnel
✅ Instant access to compliance information
✅ Real-time route optimization
✅ Quick problem resolution
✅ Reduced training time for new drivers
✅ Improved delivery efficiency

### For AgriConnect Platform
✅ Reduced delivery errors
✅ Better compliance tracking
✅ Improved customer satisfaction
✅ Data-driven insights
✅ Scalable logistics support

### For Customers
✅ Faster deliveries
✅ Better product quality
✅ Improved communication
✅ Reliable service

---

## Future Enhancements

1. **Voice Integration:** Hands-free AI assistance while driving
2. **Image Analysis:** Photo-based product quality assessment
3. **Predictive Analytics:** Delivery time predictions based on historical data
4. **Multi-language Support:** Localized assistance for different regions
5. **Offline Mode:** Cached SOPs and common responses
6. **Integration with GPS:** Real-time location-based suggestions
7. **Customer Communication:** AI-generated delivery updates

---

## Testing the AI

### Sample Queries to Test

**Cold-Chain:**
- "What temperature for dairy products?"
- "Can I accept vegetables at 8°C?"
- "Maximum time for unrefrigerated meat?"

**Route:**
- "Fastest route to [address]?"
- "Alternative routes avoiding highway?"
- "Traffic conditions on Main Street?"

**Handling:**
- "How to pack fragile produce?"
- "Safety precautions for raw meat?"
- "Loading order for mixed products?"

**Compliance:**
- "What to document for damaged goods?"
- "SOP for customer complaints?"
- "How to report temperature deviation?"

---

## Technical Implementation

### File Structure
```
src/
├── lib/
│   └── gemini.ts (AI functions + delivery_man role)
├── components/
│   └── DeliveryAIChatbot.tsx (UI component)
└── pages/
    └── delivery/
        ├── DeliveryDashboard.tsx (with AI)
        └── AssignedDeliveries.tsx (with AI + context)
```

### Dependencies
- Google Gemini 2.5 Flash API
- React (hooks: useState, useRef, useEffect)
- Lucide React (icons)
- React Hot Toast (notifications)

### Performance
- Average response time: 1-3 seconds
- Supports concurrent requests
- Automatic retry on failure
- Graceful error handling with fallbacks

---

## Conclusion

The AI integration transforms the Delivery Man portal into an intelligent logistics platform, providing real-time assistance for compliance, routing, and problem-solving. This reduces errors, improves efficiency, and ensures high-quality service delivery.
