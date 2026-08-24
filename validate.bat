@echo off
title CRIS Protocol & Dataset Model Validation
echo ======================================================================
echo    Running TypeScript Protocol Validation & MILP Optimization Solver
echo ======================================================================
echo.
npx ts-node --project tsconfig.json src/run.ts
echo.
pause
