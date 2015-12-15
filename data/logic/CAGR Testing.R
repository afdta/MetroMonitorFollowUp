#CAGR TESTING

rates <- c(1.025, 1.001, 1.02, 1.03, 1.045, 1.07, 0.925)
start <- 50

calcFinish <- function(start, rates, returnFinalOnly=TRUE){
  finish <- start
  cat("Calculations [detail]\n")
  seqm <- function(v){
    newval <- finish*v
    cat(paste(finish,"*",v,"=",newval,"\n"))
    finish <<- newval
    return(finish)
  }
  overview <- c(start, sapply(rates, seqm))
  
  cat("\nCalculations [overview]\n")
  cat(paste(overview, sep="", collapse=" -> ")) #use for byproduct of calculating finish
  cat("\n")
  
  if(returnFinalOnly){
    return(finish)
  } else{
    return(overview)
  }
}

finish <- calcFinish(start, rates)

#method 1 - CAGR
m1 <- (finish/start)^(1/length(rates))
finish1 <- calcFinish(start, rep(m1, length(rates)))

#method 2 - Geometric mean
m2 <- prod(rates)^(1/length(rates))
finish2 <- calcFinish(start, rep(m2, length(rates)))

#method 3 - log-lin regression
vals <- calcFinish(start, rates, FALSE)
df <- data.frame(ln=log(vals), per=1:length(vals))

beta <- lm(ln~per, df)
b2 <- beta$coefficients["per"]
exp(b2)-1

library(metromonitor)
#example from: http://people.stern.nyu.edu/adamodar/pdfiles/eqnotes/dcfgrowt.pdf
eps <- c(0.01, 0.02, 0.04, 0.07, 0.08, 0.16, 0.18, 0.25, 0.32)
lneps <- c(-4.6052,-3.9120,-3.2189,-2.6593,-2.5257,-1.8326,-1.7148,-1.3863,-1.1394)
log(eps) - lneps

exdf <- data.frame(ln=lneps, yr=1991:1999, per=1:9)
lm(ln~per, exdf)

epsrt <- (eps[2:9]/eps[1:8])
calcFinish(eps[1], rates = epsrt)

epscagr <- prod(epsrt)^(1/length(epsrt))

#ln(EPS) = -4.66 + 0.4212 (t): Growth rate approximately 42.12%

#method 3 - back CAGR out of aggregate growth




