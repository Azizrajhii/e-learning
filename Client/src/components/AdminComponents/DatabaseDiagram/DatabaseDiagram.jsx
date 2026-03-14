import React from "react";
import ReactFlow, { Controls, Background } from "reactflow";
import "reactflow/dist/style.css";

const DatabaseSchemaDiagram = () => {
  const nodes = [
    {
      id: "user",
      position: { x: 50, y: -150 },
      data: { label: "User" },
      className: "bg-blue-100",
    },
    {
      id: "user_fields",
      position: { x: 50, y: -100 },
      data: {
        label: (
          <div className="text-sm">
            <div>id: string</div>
            <div>name: string</div>
            <div>email: string</div>
            <div>password: string</div>
            <div>numero: string</div>
            <div>niveau: string (apprenant)</div>
            <div>specialite: string (formateur)</div>
            <div>notifications: list&lt;Notification&gt;</div>
            <div>faq_created: list&lt;FAQ&gt;</div>
            <div>comments: list&lt;Commentaire&gt;</div>
            <div>formations_inscrit: list&lt;string&gt;</div>
            <div>formations_created: list&lt;Formation&gt;</div>
            <div>quiz_resultats: list&lt;QuizResultat&gt;</div>
          </div>
        ),
      },
      className: "bg-blue-50",
    },

    {
      id: "formation",
      position: { x: 400, y: 100 },
      data: { label: "Formation" },
      className: "bg-green-100",
    },
    {
      id: "formation_fields",
      position: { x: 400, y: 150 },
      data: {
        label: (
          <div className="text-sm">
            <div>id: string</div>
            <div>titre: string</div>
            <div>description: string</div>
            <div>categorie: string</div>
            <div>numplaces: integer</div>
            <div>fichiers: list&lt;string&gt;</div>
            <div>createdby: string</div>
            <div>inscrits: list&lt;string&gt;</div>
          </div>
        ),
      },
      className: "bg-green-50",
    },

    {
      id: "lecon",
      position: { x: 700, y: 100 },
      data: { label: "Leçon" },
      className: "bg-orange-100",
    },
    {
      id: "lecon_fields",
      position: { x: 700, y: 150 },
      data: {
        label: (
          <div className="text-sm">
            <div>id: string</div>
            <div>titre: string</div>
            <div>content: string</div>
            <div>videoUrl: list&lt;string&gt;</div>
            <div>pdfUrl: list&lt;string&gt;</div>
            <div>formationId: string</div>
          </div>
        ),
      },
      className: "bg-orange-50",
    },

    {
      id: "questionnaire",
      position: { x: 400, y: 400 },
      data: { label: "Questionnaire" },
      className: "bg-red-100",
    },
    {
      id: "questionnaire_fields",
      position: { x: 400, y: 450 },
      data: {
        label: (
          <div className="text-sm">
            <div>id: string</div>
            <div>formationid: string</div>
            <div>minimumscore: integer</div>
            <div>questions: list&lt;Question&gt;</div>
          </div>
        ),
      },
      className: "bg-red-50",
    },

    {
      id: "question",
      position: { x: 700, y: 400 },
      data: { label: "Question" },
      className: "bg-yellow-100",
    },
    {
      id: "question_fields",
      position: { x: 700, y: 450 },
      data: {
        label: (
          <div className="text-sm">
            <div>id: string</div>
            <div>text: string</div>
            <div>options: list&lt;string&gt;</div>
            <div>reponse: string</div>
          </div>
        ),
      },
      className: "bg-yellow-50",
    },

    {
      id: "quiz_resultat",
      position: { x: 50, y: 600 },
      data: { label: "QuizResultat" },
      className: "bg-purple-100",
    },
    {
      id: "quizresultat_fields",
      position: { x: 50, y: 650 },
      data: {
        label: (
          <div className="text-sm">
            <div>id: string</div>
            <div>userid: string</div>
            <div>quizid: string</div>
            <div>score: integer</div>
            <div>passed: boolean</div>
          </div>
        ),
      },
      className: "bg-purple-50",
    },

    {
      id: "faq",
      position: { x: 500, y: -200 },
      data: { label: "FAQ" },
      className: "bg-pink-100",
    },
    {
      id: "faq_fields",
      position: { x: 500, y: -150 },
      data: {
        label: (
          <div className="text-sm">
            <div>id: string</div>
            <div>titre: string</div>
            <div>content: string</div>
            <div>authorid: string</div>
            <div>aime: integer</div>
            <div>je_n'aime_pas: integer</div>
            <div>comments: list&lt;Commentaire&gt;</div>
          </div>
        ),
      },
      className: "bg-pink-50",
    },

    {
      id: "commentaire",
      position: { x: 1050, y: -50 },
      data: { label: "Commentaire" },
      className: "bg-gray-100",
    },
    {
      id: "commentaire_fields",
      position: { x: 1050, y: 0 },
      data: {
        label: (
          <div className="text-sm">
            <div>id: string</div>
            <div>content: string</div>
            <div>userIdAuthor: string</div>
            <div>userIdCommenter: string</div>
          </div>
        ),
      },
      className: "bg-gray-50",
    },

    {
      id: "notification",
      position: { x: -200, y: 100 },
      data: { label: "Notification" },
      className: "bg-indigo-100",
    },
    {
      id: "notification_fields",
      position: { x: -200, y: 150 },
      data: {
        label: (
          <div className="text-sm">
            <div>id: string</div>
            <div>recipient: string</div>
            <div>sender: string</div>
            <div>message: string</div>
            <div>time: string</div>
            <div>unread: boolean</div>
          </div>
        ),
      },
      className: "bg-indigo-50",
    },
  ];

  const edges = [
    { id: "user-formation", source: "user", target: "formation", label: "1..*" },
    { id: "formation-lecon", source: "formation", target: "lecon", label: "1..*" },
    { id: "formation-questionnaire", source: "formation", target: "questionnaire", label: "1..*" },
    { id: "questionnaire-question", source: "questionnaire", target: "question", label: "1..*" },
    { id: "user-quizresultat", source: "user", target: "quiz_resultat", label: "1..*" },
    { id: "faq-commentaire", source: "faq", target: "commentaire", label: "0..*" },
    { id: "user-faq", source: "user", target: "faq", label: "1..*" },
    { id: "user-notification", source: "user", target: "notification", label: "0..*" },
    { id: "user-commentaire", source: "user", target: "commentaire", label: "0..*" },
  ];

  return (
    <div style={{ width: "100%", height: "90vh" }}>
      <ReactFlow nodes={nodes} edges={edges} fitView attributionPosition="top-right">
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
};

export default DatabaseSchemaDiagram;
