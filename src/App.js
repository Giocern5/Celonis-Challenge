import { useState } from "react";
import "./App.css";
import * as Parser from "./parser/formula-parser.js";
const parse = Parser.parse;

function getMathSymbol(type) {
  if (type === "ADDITION") return "+";
  else if (type === "DIVISION") return "/";
  else if (type === "MULTIPLICATION") return "*";
  else if (type === "SUBTRACTION") return "-";
  else if (type === "PI") return "PI";
  else return;
}

const styles = {
  fun: { color: "blue" },
  value: { backgroundColor: "yellow" },
};

//seperated to be able to add removing logic
function customDisplay(value) {
  return (
    <span style={styles.value}>
      {value}
      {/*
        ADD CODE TO REMOVE HERE
      <button>x</button> */}
    </span>
  );
}

function displayTree(node) {
  if (!node) return null;

  switch (node.type) {
    case "FUNCTION":
      return (
        <span>
          <span style={styles.fun}> {node.name + node.type} </span>
          {node.arguments.map(displayTree)}
          <span style={styles.fun}> {")"}</span>
        </span>
      );

    case "PI":
      return customDisplay(node.type);

    case "PAREN":
      return <span>({displayTree(node.expression)})</span>;

    case "VARIABLE":
      return customDisplay(node.name);

    case "NUMBER":
      return customDisplay(node.value);

    case "ADDITION":
      return (
        <span style={styles.ADDITION}>
          {displayTree(node.left)} + {displayTree(node.right)}
        </span>
      );

    case "DIVISION":
      return (
        <span>
          {displayTree(node.left)} / {displayTree(node.right)}
        </span>
      );

    case "SUBTRACTION":
      return (
        <span style={styles.SUBTRACTION}>
          {displayTree(node.left)} - {displayTree(node.right)}
        </span>
      );

    case "MULTIPLICATION":
      return (
        <span>
          {displayTree(node.left)} * {displayTree(node.right)}
        </span>
      );
    default:
      return null;
  }
}

function App() {
  let [formula, formulaChange] = useState(
    //"($b + SQRT (SQR($b) - 4 * $a)) / (2 * $a)"
    "1 + 2 + 3"
  );
  let [syntaxTree, syntaxTreeChange] = useState("");
  let [syntaxTreeJson, syntaxTreeJsonChange] = useState(null);
  let [visualizerOutput, visualizerChange] = useState("");
  let [visualizedTree, updateVisualizedTree] = useState(null);

  const updateAst = () => {
    console.log("creating ast view...");
    const newSyntaxTree = parse(formula);
    syntaxTreeChange(newSyntaxTree);

    console.log("The ast is: ", syntaxTree);
    syntaxTreeJsonChange(JSON.stringify(newSyntaxTree, null, 2));
  };

  const convertAstToFormula = () => {
    console.log("converting ast to string...");
    //JSON.parse(syntaxTreeJson);
    let formulaString = "";

    // use Inorder traversal for tree
    const createFormulaString = (node) => {
      if (!node) return;
      createFormulaString(node.left);
      if (node.value ?? getMathSymbol(node.type) ?? node.name) {
        formulaString += getMathSymbol(node.type) ?? node.value ?? node.name;
      }
      // special casing for parenthesis in expressions and arguments
      if (node.expression) {
        formulaString += "(";
        createFormulaString(node.expression);
        formulaString += ")";
      }
      if (node.arguments) {
        formulaString += "(";
        node.arguments.forEach(createFormulaString);
        formulaString += ")";
      }
      createFormulaString(node.right);
    };

    createFormulaString(JSON.parse(syntaxTreeJson));
    visualizerChange(formulaString);
  };

  // renders view from json tree
  const renderFormulaTree = () => {
    updateVisualizedTree(displayTree(JSON.parse(syntaxTreeJson)));
  };

  return (
    <div className="formulizer">
      <h1>Welcome to the formulizer!</h1>
      <h3>Input formula</h3>
      <p>
        <textarea
          cols={100}
          rows={8}
          value={formula}
          onChange={(event) => formulaChange(event.target.value)}
        />{" "}
        <br />
      </p>
      <p>
        <button onClick={updateAst}>Parse and update AST View</button>
      </p>
      <h3>Syntax tree</h3>
      <pre
        style={{
          maxHheight: "100px",
          overflowy: "auto",
          backgroundColor: "#eeeeee",
        }}
      >
        {syntaxTreeJson}
      </pre>
      <p>
        <button onClick={convertAstToFormula}>Convert AST to Formula</button>
      </p>
      <h3>Visualizer-to-Formula</h3>
      <p>{visualizerOutput}</p>

      <p>
        <button onClick={renderFormulaTree}>Show Visual</button>
      </p>
      <h3>Visualized Tree</h3>
      <div
        style={{
          height: "100px",
          fontSize: "30px",
        }}
      >
        {visualizedTree}
      </div>
    </div>
  );
}

export default App;
