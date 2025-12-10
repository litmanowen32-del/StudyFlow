import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calculator as CalculatorIcon } from "lucide-react";

export default function Calculator() {
  const [display, setDisplay] = useState("0");
  const [previousValue, setPreviousValue] = useState<string | null>(null);
  const [operator, setOperator] = useState<string | null>(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);

  const inputDigit = (digit: string) => {
    if (waitingForOperand) {
      setDisplay(digit);
      setWaitingForOperand(false);
    } else {
      setDisplay(display === "0" ? digit : display + digit);
    }
  };

  const inputDecimal = () => {
    if (waitingForOperand) {
      setDisplay("0.");
      setWaitingForOperand(false);
      return;
    }
    if (!display.includes(".")) {
      setDisplay(display + ".");
    }
  };

  const clear = () => {
    setDisplay("0");
    setPreviousValue(null);
    setOperator(null);
    setWaitingForOperand(false);
  };

  const performOperation = (nextOperator: string) => {
    const inputValue = parseFloat(display);

    if (previousValue === null) {
      setPreviousValue(display);
    } else if (operator) {
      const currentValue = parseFloat(previousValue);
      let result: number;

      switch (operator) {
        case "+":
          result = currentValue + inputValue;
          break;
        case "-":
          result = currentValue - inputValue;
          break;
        case "×":
          result = currentValue * inputValue;
          break;
        case "÷":
          result = inputValue !== 0 ? currentValue / inputValue : 0;
          break;
        default:
          result = inputValue;
      }

      setDisplay(String(result));
      setPreviousValue(String(result));
    }

    setWaitingForOperand(true);
    setOperator(nextOperator);
  };

  const calculate = () => {
    if (!operator || previousValue === null) return;

    const inputValue = parseFloat(display);
    const currentValue = parseFloat(previousValue);
    let result: number;

    switch (operator) {
      case "+":
        result = currentValue + inputValue;
        break;
      case "-":
        result = currentValue - inputValue;
        break;
      case "×":
        result = currentValue * inputValue;
        break;
      case "÷":
        result = inputValue !== 0 ? currentValue / inputValue : 0;
        break;
      default:
        result = inputValue;
    }

    setDisplay(String(result));
    setPreviousValue(null);
    setOperator(null);
    setWaitingForOperand(true);
  };

  const toggleSign = () => {
    const value = parseFloat(display);
    setDisplay(String(value * -1));
  };

  const percentage = () => {
    const value = parseFloat(display);
    setDisplay(String(value / 100));
  };

  const buttonClass = "h-14 text-lg font-medium";

  return (
    <div className="container mx-auto px-6 py-8 max-w-md">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-primary">
          <CalculatorIcon className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Calculator</h1>
          <p className="text-muted-foreground text-sm">Quick calculations</p>
        </div>
      </div>

      <Card>
        <CardContent className="p-4">
          {/* Display */}
          <div className="bg-muted rounded-lg p-4 mb-4">
            <div className="text-right text-3xl font-mono text-foreground truncate">
              {display}
            </div>
          </div>

          {/* Buttons */}
          <div className="grid grid-cols-4 gap-2">
            <Button variant="secondary" className={buttonClass} onClick={clear}>
              AC
            </Button>
            <Button variant="secondary" className={buttonClass} onClick={toggleSign}>
              +/-
            </Button>
            <Button variant="secondary" className={buttonClass} onClick={percentage}>
              %
            </Button>
            <Button variant="default" className={buttonClass} onClick={() => performOperation("÷")}>
              ÷
            </Button>

            <Button variant="outline" className={buttonClass} onClick={() => inputDigit("7")}>
              7
            </Button>
            <Button variant="outline" className={buttonClass} onClick={() => inputDigit("8")}>
              8
            </Button>
            <Button variant="outline" className={buttonClass} onClick={() => inputDigit("9")}>
              9
            </Button>
            <Button variant="default" className={buttonClass} onClick={() => performOperation("×")}>
              ×
            </Button>

            <Button variant="outline" className={buttonClass} onClick={() => inputDigit("4")}>
              4
            </Button>
            <Button variant="outline" className={buttonClass} onClick={() => inputDigit("5")}>
              5
            </Button>
            <Button variant="outline" className={buttonClass} onClick={() => inputDigit("6")}>
              6
            </Button>
            <Button variant="default" className={buttonClass} onClick={() => performOperation("-")}>
              −
            </Button>

            <Button variant="outline" className={buttonClass} onClick={() => inputDigit("1")}>
              1
            </Button>
            <Button variant="outline" className={buttonClass} onClick={() => inputDigit("2")}>
              2
            </Button>
            <Button variant="outline" className={buttonClass} onClick={() => inputDigit("3")}>
              3
            </Button>
            <Button variant="default" className={buttonClass} onClick={() => performOperation("+")}>
              +
            </Button>

            <Button variant="outline" className={`${buttonClass} col-span-2`} onClick={() => inputDigit("0")}>
              0
            </Button>
            <Button variant="outline" className={buttonClass} onClick={inputDecimal}>
              .
            </Button>
            <Button variant="default" className={buttonClass} onClick={calculate}>
              =
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
