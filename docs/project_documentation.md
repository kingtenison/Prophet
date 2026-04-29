# CANDIDATES’ DECLARATION
I/We hereby declare that this project report is the result of my/our own original work and that no part of it has been presented for another degree in this university or elsewhere.

# SUPERVISOR’S DECLARATION
I hereby declare that the preparation and presentation of this project report were supervised in accordance with the guidelines on supervision of project reports laid down by the University.

# DEDICATION
This work is dedicated to our families, friends, and everyone who supported us throughout the development of this project.

# ACKNOWLEDGEMENTS
We would like to express our profound gratitude to our supervisor for their invaluable guidance, constant encouragement, and constructive feedback throughout the course of this project. We also thank our peers and instructors for their support and insights.

# ABSTRACT
The rapid growth of data in the modern business environment has made data analytics and visualization indispensable for decision-making. However, existing Business Intelligence (BI) tools are often complex, resource-intensive, and cost-prohibitive for Small and Medium Enterprises (SMEs). This project presents the design and development of "Prophet" (Power BI Lite), a lightweight, web-based data visualization and dashboarding application. Built using modern web technologies including Next.js, React, Tailwind CSS, and Supabase, the system enables users to easily upload CSV datasets, generate interactive charts, and construct comprehensive dashboards without requiring advanced technical skills. The system architecture leverages client-side data parsing to minimize server load and ensure rapid feedback. The final product provides an accessible, cost-effective, and highly responsive platform for market intelligence and operational data analysis, successfully bridging the gap between raw data and actionable business insights.

---

# Table of Contents
CANDIDATES’ DECLARATION	4
SUPERVISOR’S DECLARATION	5
DEDICATION	6
ACKNOWLEDGEMENTS	7
ABSTRACT	8
List of Tables	11
List of Figures	12

**CHAPTER 1**	13
1.1 Introduction	13
1.2 Background	13
1.3 Statement of the Problem	13
1.4 Study Objectives	13
1.4.1 General Objective	13
1.4.2 Specific Objectives	13
1.5 Scope of the Project	13
1.6 Methodology for Project	13
1.7 Significance of the Project	13
1.8 Limitations of the Project	13
1.9 Organization of the Report	13
1.10 Chapter Summary	13

**CHAPTER 2: LITERATURE REVIEW**	14
2.1 Introduction	14
2.2 General background of the study area	14
2.3 Review of Existing Systems and Technologies	14
2.4 Proposed System	14
2.5 Chapter Summary	14

**CHAPTER 3: METHODOLOGY**	15
3.1 Introduction	15
3.2 System Development Methodology	15
3.3 Crystallization of the Problem	15
3.4 Requirements of the Proposed System	15
3.4.1 Functional Requirement	15
3.4.2 Non-Functional Requirement	15
3.4.3 Software Requirements	15
3.5 Design of the System	15
3.5.1 Flowchart Diagram	16
3.5.2 Context Diagram	16
3.5.3 Entity Relationship Diagram (ERD)	16
3.5.4 Data Flow Diagram (DFD)	16
3.5.5 Use Case Diagram	16
3.6 Chapter Summary	16

**CHAPTER 4: IMPLEMENTATION AND DOCUMENTATION OF THE PROPOSED SYSTEM**	16
4.1 Introduction	16
4.2 Testing Approaches	16
4.2.1 Unit Testing	17
4.2.2 Functional Testing	17
4.2.3 Usability Testing	17
4.2.4 Acceptance Testing	17
4.2.5 Selected Testing Approach	17
4.3 Implementation of the Current System	17
4.3.1 Parallel implementation	17
4.3.2 Pilot implementation	17
4.3.3 Direct implementation	17
4.3.4 Phased Implementation	17
4.4 System Documentation	17
4.5 Implementation Challenges	17
4.6 Chapter Summary	17

**CHAPTER 5: SUMMARY, CONCLUSIONS AND RECOMMENDATIONS**	18
5.1 Introduction	18
5.2 Summary	18
5.3 Limitations of the Study	18
5.4 Recommendations for Future Research	18
5.5 Conclusion	18
REFERENCES	18
APPENDICES	18

---

# List of Tables 
Table 3.1: Hardware Requirements
Table 3.2: Software Requirements

# List of Figures 
Figure 2.1: Tableau Dashboard Architecture
Figure 2.2: Microsoft Power BI Interface
Figure 3.1: System Flowchart
Figure 3.2: Context Diagram
Figure 3.3: ER Diagram
Figure 3.4: Dataflow Diagram
Figure 3.5: Use Case Diagram

---
 
# CHAPTER 1 
## GENERAL INTRODUCTION 

### 1.1 Introduction
The digital era has led to an unprecedented explosion of data across all business sectors. Organizations that harness this data effectively gain a significant competitive advantage. Business Intelligence (BI) platforms are at the core of this transformation, providing tools to ingest, process, and visualize data. The project, Prophet (Power BI Lite), aims to democratize access to data analytics by offering a streamlined, accessible web application for creating dynamic dashboards.

### 1.2 Background
Historically, BI tools were strictly enterprise-level solutions requiring dedicated servers, specialized IT personnel, and extensive training. Over the past decade, platforms like Microsoft Power BI and Tableau revolutionized the market by introducing self-service analytics. However, for many individuals, startups, and Small and Medium Enterprises (SMEs), these industry standards remain overly complex, bloated with unnecessary features, and cost-prohibitive. There is a growing demand for lightweight, browser-based alternatives that focus on core visualization needs without the steep learning curve.

### 1.3 Statement of the Problem
Despite the availability of sophisticated data analysis tools, small businesses and independent analysts often struggle to adopt them due to high licensing costs, complex configuration requirements, and the need for specialized knowledge. Many users rely on basic spreadsheet software (like Microsoft Excel) which falls short in providing interactive, real-time visual insights and dynamic dashboards. A lightweight, user-friendly, and cost-effective web-based alternative is required to bridge the gap between raw data sets (like CSV files) and actionable visual insights.

### 1.4 Study Objectives 

#### 1.4.1 General Objective 
To design and develop a lightweight, web-based Business Intelligence application (Prophet / Power BI Lite) that allows users to upload datasets, generate interactive charts, and build customizable dashboards for data-driven decision-making.

#### 1.4.2 Specific Objectives 
1. To develop a secure user authentication system with user profiles.
2. To implement a robust client-side CSV parsing engine capable of handling datasets efficiently.
3. To build a dynamic chart builder interface supporting various chart types (Bar, Line, Pie, Area).
4. To create a customizable dashboard environment where users can save, arrange, and view data widgets.
5. To deploy the application using scalable cloud infrastructure (Vercel and Supabase).

### 1.5 Scope of the Project
The scope of this project is confined to the development of a web application utilizing the Next.js framework. The system supports uploading of tabular data in CSV format (up to 5MB). It features client-side data aggregation and visualization using Recharts. Database and backend services are handled via Supabase (BaaS), encompassing user authentication, dataset metadata storage, and dashboard configurations. The project does not currently support live database connections (e.g., direct hooks into MySQL/PostgreSQL databases) or real-time multi-user collaborative editing.

### 1.6 Methodology for Project
The project adopted the Agile Software Development methodology. This approach was selected because it promotes continuous iteration of development and testing throughout the software development lifecycle. The project was divided into sprints, allowing for the rapid prototyping of core features (like file upload and parsing) followed by progressive refinement of the user interface and chart building functionalities.

### 1.7 Significance of the Project
This project provides immense value to resource-constrained organizations and individuals by offering a free or low-cost alternative to enterprise BI tools. By prioritizing ease of use and immediate visual feedback, Prophet enables non-technical users to perform market intelligence analysis, track KPIs, and extract insights from their data efficiently.

### 1.8 Limitations of the Project
- The system currently restricts dataset uploads to a maximum of 5MB and processes a maximum of 50,000 rows to ensure optimal client-side performance.
- Only CSV file formats are supported for the Minimum Viable Product (MVP); Excel (.xlsx) support is excluded.
- The dashboard layout relies on CSS Grid and does not currently feature full drag-and-drop free-positioning of widgets.

### 1.9 Organization of the Report
This report is organized into five main chapters. Chapter 1 provides the general introduction, background, and objectives. Chapter 2 reviews relevant literature and existing systems. Chapter 3 outlines the methodology and system design. Chapter 4 details the system implementation, testing, and documentation. Finally, Chapter 5 presents the summary, conclusions, and recommendations for future enhancements.

### 1.10 Chapter Summary
This chapter introduced the Prophet (Power BI Lite) project, highlighting the critical need for a lightweight BI tool. It outlined the background, problem statement, specific objectives, scope, methodology, and limitations, setting the foundational context for the system's development discussed in subsequent chapters.

---

# CHAPTER 2 
## LITERATURE REVIEW 

### 2.1 Introduction 
This chapter presents a review of relevant literature concerning Business Intelligence and data visualization technologies. It examines existing systems in the market, analyzes their strengths and weaknesses, and justifies the architectural and functional design choices for the proposed Prophet system based on insights gained from these evaluations.

### 2.2 General background of the study area
Data visualization is the graphical representation of information and data. By using visual elements like charts, graphs, and maps, data visualization tools provide an accessible way to see and understand trends, outliers, and patterns in data. In the era of Big Data, visual analytics has transitioned from a luxury to an operational necessity. Web-based visualization frameworks have evolved rapidly, driven by advancements in JavaScript rendering libraries (like D3.js and Recharts) and powerful frontend frameworks (React, Next.js).

### 2.3 Review of Existing Systems and Technologies 
Several dominant systems exist in the data visualization domain:
1. **Microsoft Power BI**: A powerful enterprise tool with deep integrations into the Microsoft ecosystem. While highly capable, it requires a steep learning curve, a Windows environment for its desktop client, and can be expensive for small teams.
2. **Tableau**: Renowned for its exceptional visualization capabilities and intuitive drag-and-drop interface. However, Tableau's licensing costs are prohibitive for SMEs, and its web authoring capabilities often lag behind its desktop counterpart.
3. **Google Looker Studio**: A free, cloud-based alternative that integrates well with Google services. However, its customization options are limited, and it struggles with complex data transformations without external SQL preprocessing.

**Insights Gained:** Reviewing these systems highlighted a distinct market gap. While enterprise tools offer overwhelming functionality, they sacrifice speed and simplicity. The proposed system must focus on immediate "time-to-value"—allowing a user to upload a file and see a chart within seconds without configuring data models or writing queries.

### 2.4 Proposed System 
The proposed system, Prophet (Power BI Lite), is designed to address the shortfalls of existing heavy-weight BI tools. It is a completely web-native platform built on Next.js (React). 
Unlike desktop-bound tools, it runs entirely in the browser. It addresses the complexity of traditional tools by offering a streamlined workflow: Upload CSV -> Map Columns -> Generate Chart -> Save to Dashboard. By leveraging client-side parsing (PapaParse) and state management (Zustand), the system avoids heavy server round-trips, resulting in a snappy, responsive user experience. Data persistence and secure user authentication are elegantly handled by Supabase, ensuring enterprise-grade security within a lightweight package.

### 2.5 Chapter Summary
This chapter reviewed the landscape of data visualization platforms, comparing industry leaders like Power BI and Tableau. It identified the need for a simpler, cost-effective alternative and introduced Prophet as the proposed web-native solution designed specifically for ease of use and rapid insight generation.

---

# CHAPTER 3
## METHODOLOGY

### 3.1 Introduction	
This chapter outlines the methodology employed to analyze, design, and develop the Prophet system. It details the system requirements, both functional and non-functional, and presents the conceptual models (UML and Data Flow diagrams) used to blueprint the system architecture.

### 3.2 System Development Methodology 
The Agile methodology, specifically utilizing iterative sprints, was adopted for this project. Agile was chosen over traditional Waterfall because web application development requires high flexibility and rapid adaptation to user feedback. Sprints allowed for continuous integration and testing. For instance, the data parsing module was built and tested in an isolated sprint before being integrated into the broader UI components, ensuring stability at each development phase.

### 3.3 Crystallization of the Problem 
During the initial problem analysis, several key issues were identified:
- Users found uploading and parsing data on remote servers too slow.
- Complex configuration menus in existing tools deterred non-technical users.
- Securing user data dynamically required a robust but easily implementable backend.
These issues led to specific architectural decisions: moving data parsing entirely to the client-side (browser) using PapaParse to eliminate upload bottlenecks, designing a minimalist "Royal Blue" UI using Tailwind CSS for intuitive navigation, and utilizing Supabase for secure Row Level Security (RLS).

### 3.4 Requirements of the Proposed System	
The system requirements define what the application must do and the constraints under which it must operate.

#### 3.4.1 Functional Requirement 
- The system must allow users to register and securely log in.
- The system must allow users to upload CSV files up to 5MB.
- The system must parse CSV data and automatically detect data types (categorical vs. numeric).
- The system must provide a chart builder to generate Bar, Line, Area, and Pie charts.
- The system must allow users to save charts as widgets and arrange them into named dashboards.

#### 3.4.2 Non-Functional Requirement	
- **Performance**: Charts must render within 2 seconds of dataset processing.
- **Usability**: The application must be fully responsive, functioning on mobile devices and large desktop monitors.
- **Security**: User data must be isolated; a user cannot view or edit dashboards belonging to another user unless explicitly marked public.

#### 3.4.3 Software and Hardware Requirements

**Table 3.1: Hardware Requirements**
| Component | Minimum Requirement | Recommended |
| :--- | :--- | :--- |
| Processor | Dual Core 2.0 GHz | Quad Core 2.5 GHz or higher |
| Memory (RAM) | 4 GB | 8 GB |
| Storage | 1 GB Free Space | 5 GB Free Space |
| Display | 1024x768 resolution | 1920x1080 resolution |

**Table 3.2: Software Requirements**
| Component | Specification |
| :--- | :--- |
| Operating System | Windows, macOS, or Linux |
| Web Browser | Google Chrome, Mozilla Firefox, Safari, Edge |
| Frontend Framework | Next.js 14, React 18, TailwindCSS |
| Backend/Database | Supabase (PostgreSQL) |
| Core Libraries | Recharts, PapaParse, Zustand, Lucide React |

### 3.5 Design of the System 
The system design translates requirements into a blueprint for construction.

#### 3.5.1 Flowchart Diagram
The flowchart logic dictates: User Access -> Authentication Check -> Dashboard Hub -> (Option A: View Dashboards) OR (Option B: Upload Dataset -> Process Data -> Build Chart -> Save Widget -> Add to Dashboard).

#### 3.5.2 Context Diagram
The Context Diagram defines the system boundary. The central entity is the "Prophet BI System". External entities interacting with it include the "User" (provides CSV data, views charts) and the "Supabase Backend" (provides authentication tokens, stores metadata).

#### 3.5.3 Entity Relationship Diagram (ERD)
The database structure relies on four core tables:
- `profiles` (id, email, display_name)
- `datasets` (id, user_id, file_name, columns, url)
- `dashboards` (id, user_id, title, is_public)
- `widgets` (id, dashboard_id, dataset_id, chart_type, config)
Relationships: A User has many Datasets and Dashboards. A Dashboard has many Widgets. A Widget belongs to one Dataset.

#### 3.5.4 Data Flow Diagram (DFD)
Level 0 DFD illustrates data movement: 
1. User submits Login Credentials -> System validates via Auth API.
2. User uploads CSV -> System parses file -> Generates JSON Array.
3. System applies Group-By/Aggregation Logic -> Yields Chart Data.
4. Chart Data fed to Recharts Library -> Renders SVG output to User.

#### 3.5.5 Use Case Diagram
Actors: Authenticated User, Guest User.
Use Cases: Sign Up, Log In, Upload Dataset, Configure Chart, Create Dashboard, View Public Dashboard.

### 3.6 Chapter Summary 	
This chapter detailed the Agile methodology used for the project. It explicitly mapped out functional and non-functional requirements and provided structural designs including ERDs, DFDs, and Use Case models to guide the implementation phase.

---

# CHAPTER 4 
## IMPLEMENTATION AND DOCUMENTATION OF THE PROPOSED SYSTEM

### 4.1 Introduction 
This chapter covers the transition from design to a working system. It outlines the testing methodologies applied to ensure software reliability, discusses the implementation strategies, and provides system documentation detailing the application's final features.

### 4.2 Testing Approaches
Robust testing is critical to ensure data integrity and a seamless user experience.

#### 4.2.1 Unit Testing
Individual functions were tested in isolation. For example, the `aggregate.ts` library function was tested to ensure it correctly performed mathematical sums, averages, and counts on mock JSON data arrays.

#### 4.2.2 Functional Testing
Functional tests verified that the system met the functional requirements. Tests included verifying that a CSV upload correctly populated the database and triggered the chart builder interface without errors.

#### 4.2.3 Usability Testing
Usability testing involved testing the UI responsiveness across various screen sizes (using browser DevTools) to ensure the Tailwind CSS grid layouts adapted correctly for mobile, tablet, and desktop views.

#### 4.2.4 Acceptance Testing
End-to-end user flows were tested simulating a real user: logging in, uploading a sales dataset, creating a bar chart of sales by region, and saving it to a final dashboard.

#### 4.2.5 Selected Testing Approach 
An iterative Functional and Usability testing approach was prioritized. Because the application heavily relies on client-side visual feedback, automated unit tests were supplemented with rigorous manual UI/UX testing to ensure animations, hover states, and chart renderings performed flawlessly.

### 4.3 Implementation of the Current System 

#### 4.3.1 Parallel implementation 
Not applicable for this greenfield project, as it does not replace an existing legacy system running concurrently.

#### 4.3.2 Pilot implementation  
The system was deployed to a staging environment on Vercel to allow a small group of users to test the data upload and charting capabilities before finalized deployment.

#### 4.3.3 Direct implementation 
The final production build (`npm run build`) was deployed directly via Vercel, making the application instantly live for end-users globally.

#### 4.3.4 Phased Implementation
Features were rolled out in phases:
- Phase 1: Authentication and UI Shell.
- Phase 2: CSV Upload and Client-side parsing.
- Phase 3: Chart generation and Dashboard saving (The current state).

### 4.4 System Documentation 
The application provides a comprehensive suite of features:
- **Authentication Module**: Secure login/signup routed through `app/(auth)`.
- **Data Upload Center**: A drag-and-drop zone limiting files to 5MB, providing immediate feedback on row count and column types.
- **Chart Builder Engine**: A dynamic interface allowing users to select X-axis, Y-axis, and Aggregation methods (Sum, Average, Count). It features live preview rendering using Recharts.
- **Dashboard Hub**: A responsive CSS-grid based layout where users can view saved widgets collectively to monitor multi-faceted metrics.

### 4.5 Implementation Challenges 
- **Challenge 1: Client-Side Parsing Performance.** Parsing large CSV files on the main browser thread caused UI freezing. 
  *Solution:* Implementing PapaParse with streaming or limiting data to 50k rows mitigated memory overload and maintained a smooth UI.
- **Challenge 2: Responsive Grid Layouts.** Ensuring charts didn't break out of their containers on mobile devices was difficult.
  *Solution:* Implementing `ResponsiveContainer` from Recharts and utilizing Tailwind's flexible grid classes (`grid-cols-1 md:grid-cols-2 lg:grid-cols-3`) solved the scaling issues.
- **Challenge 3: State Persistence.** Passing chart configurations between the builder page and the dashboard page.
  *Solution:* Utilizing Zustand for global state management (`useChartBuilderStore`) enabled seamless data transfer across Next.js routes.

### 4.6 Chapter Summary 	
This chapter described the rigorous testing framework applied to the system, the phased implementation strategy, and documented the core features and the technical challenges overcome during development.

---

# CHAPTER 5 
## SUMMARY, CONCLUSIONS AND RECOMMENDATIONS

### 5.1 Introduction	
This final chapter provides a conclusive summary of the project. It reviews the study limitations, offers recommendations for future enhancements, and delivers a final conclusion on the project's success in meeting its original objectives.

### 5.2 Summary 
The Prophet (Power BI Lite) project was conceived to solve the problem of inaccessible, overly complex Business Intelligence tools for SMEs. By successfully developing a Next.js and Supabase-powered web application, the project achieved its goal of providing a lightweight, user-friendly platform. Users can now securely authenticate, upload datasets, seamlessly generate data visualizations, and compile interactive dashboards without requiring any programming knowledge.

### 5.3 Limitations of the Study
- **Data Source Restrictions**: The system is currently limited to static CSV file uploads. It lacks the ability to connect to live SQL databases or REST APIs for real-time data streaming.
- **File Size**: The 5MB upload limit prevents the analysis of truly massive datasets.
- **Advanced Analytics**: The system handles basic aggregations but lacks advanced statistical forecasting or machine learning-driven predictive analytics.

### 5.4 Recommendations for Future Research
For future iterations of the Prophet system, the following enhancements are recommended:
1. **Live Database Connectors**: Implement secure OAuth connections to allow users to pull data directly from cloud databases (PostgreSQL, MySQL, Snowflake).
2. **Advanced Layout Management**: Integrate a library like `react-grid-layout` to enable freeform, drag-and-drop resizing and positioning of dashboard widgets.
3. **Export Functionality**: Add features allowing users to export dashboards as high-resolution PDFs or export aggregated chart data back into CSV format.
4. **Multi-Series Charts**: Expand the chart engine to support grouped and stacked charts involving multiple data series.

### 5.5 Conclusion
The development of Prophet (Power BI Lite) has successfully demonstrated that powerful data visualization and Business Intelligence capabilities can be delivered in a lightweight, accessible web format. By prioritizing user experience, employing modern client-side processing, and leveraging scalable cloud infrastructure, the project provides a robust solution for democratizing data analytics. The system meets all its specified functional and non-functional requirements, offering a solid foundation for future expansion into a full-scale enterprise analytics platform.

---

# REFERENCES 

1. Next.js Documentation. (2024). Building Applications with Next.js App Router. Vercel Inc. URL: https://nextjs.org/docs
2. Recharts: A composable charting library built on React components. (2024). URL: https://recharts.org/
3. Supabase Documentation. (2024). The Open Source Firebase Alternative. URL: https://supabase.com/docs
4. Tailwind CSS Documentation. (2024). Rapidly build modern websites without ever leaving your HTML. Tailwind Labs. URL: https://tailwindcss.com/docs
5. Zustand: Bear necessities for state management in React. (2024). URL: https://github.com/pmndrs/zustand

# APPENDICES 

## Appendix A: Programming Codes 
*Note: Due to length constraints, core code excerpts are provided below.*

**A.1 Client-side Aggregation Utility (`lib/data/aggregate.ts`)**
```typescript
export function aggregateData(data: any[], xAxis: string, yAxis: string, method: string) {
  const result = data.reduce((acc, curr) => {
    const key = curr[xAxis];
    if (!acc[key]) acc[key] = { key, value: 0, count: 0 };
    acc[key].value += Number(curr[yAxis]) || 0;
    acc[key].count += 1;
    return acc;
  }, {});

  return Object.values(result).map((item: any) => ({
    [xAxis]: item.key,
    [yAxis]: method === 'average' ? item.value / item.count : item.value
  }));
}
```

**A.2 Zustand Store for Chart Building (`store/useChartBuilderStore.ts`)**
```typescript
import { create } from 'zustand';

interface ChartBuilderState {
  datasetId: string | null;
  chartType: string;
  xAxis: string;
  yAxis: string;
  aggregation: string;
  setChartConfig: (config: Partial<ChartBuilderState>) => void;
}

export const useChartBuilderStore = create<ChartBuilderState>((set) => ({
  datasetId: null,
  chartType: 'bar',
  xAxis: '',
  yAxis: '',
  aggregation: 'sum',
  setChartConfig: (config) => set((state) => ({ ...state, ...config })),
}));
```
