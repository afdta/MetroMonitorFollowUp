library("reshape2")
library("metromonitor")
library("jsonlite")

#IMPORT
tryCatch(
  {
    setwd("/home/alec/Projects/Brookings/metro-index/data/")
    cat("Working directory set to: /home/alec/Projects/metro-index/data/ \n")  
  },
  warning = function(w){print(w)},
  error = function(e){
    setwd("/home/alec/Projects/Brookings/DataViz/metro-index/data/")
    cat("Working directory set to: /home/alec/Projects/Brookings/DataViz/metro-index/data/ \n")
  },
  finally={
    #nothing to do
  }
)

nastr <- c("na","N/A","NA","")

GrChg <- read.csv("Growth Change.csv", stringsAsFactors=FALSE, na.strings=nastr)
GrRnk <- read.csv("Growth Ranks.csv", stringsAsFactors=FALSE, na.strings=nastr)
GrVal <- read.csv("Growth Values.csv", stringsAsFactors=FALSE, na.strings=nastr)

IncRaceChg <- read.csv("Inclusion by Race AD Change.csv", stringsAsFactors=FALSE, na.strings=nastr)
IncRaceRnk <- read.csv("Inclusion by Race AD Ranks.csv", stringsAsFactors=FALSE, na.strings=nastr)
IncRaceVal <- read.csv("Inclusion by Race AD Values.csv", stringsAsFactors=FALSE, na.strings=nastr)

IncChg <- read.csv("Inclusion Change.csv", stringsAsFactors=FALSE, na.strings=nastr)
IncChgS <- read.csv("Inclusion Change with Sig.csv", stringsAsFactors=FALSE, na.strings=nastr)
IncRnk <- read.csv("Inclusion Ranks.csv", stringsAsFactors=FALSE, na.strings=nastr)
IncVal <- read.csv("Inclusion Values.csv", stringsAsFactors=FALSE, na.strings=nastr)

ProChg <- read.csv("Prosperity Change.csv", stringsAsFactors=FALSE, na.strings=nastr)
ProRnk <- read.csv("Prosperity Ranks.csv", stringsAsFactors=FALSE, na.strings=nastr)
ProVal <- read.csv("Prosperity Values.csv", stringsAsFactors=FALSE, na.strings=nastr)

ProIdx <- read.csv("Prosperity Index.csv", stringsAsFactors=FALSE, na.strings=nastr)
AllIdx <- read.csv("All Indicators Indexed.csv", stringsAsFactors=FALSE, na.strings=nastr)

#For decennial census 2000 is actually 1999
IncVal[IncVal$Year==2000, "Year"] <- 1999

#get metro ID
metID <- metropops(TRUE, "2013")[c("CBSA_Code","CBSA_Title")]
metID$Geo <- factor(metID$CBSA_Code, levels=metID$CBSA_Code, labels=metID$CBSA_Title)
sum(metID$Geo == metID$CBSA_Title)

GRCHG <- GrChg[GrChg$CBSA %in% metID$CBSA_Code & GrChg$year == "2009-2014", ]
PROCHG <- ProChg[ProChg$CBSA %in% metID$CBSA_Code & ProChg$year == "2009-2014",, ]
INCCHG <- IncChg[IncChg$CBSA %in% metID$CBSA_Code & IncChg$Race=="Total" & IncChg$Year=="2009-2014", c("Year", "CBSA", "CBSA.Name", "Indicator", "Value", "SE")]

GRCHG$IND <- ifelse(GRCHG$indicator=="Percent Change in Aggregate Wages", "Wages", ifelse(GRCHG$indicator=="Percent Change in Employment", "Emp", "GMP"))
PROCHG$IND <- ifelse(PROCHG$indicator=="Percent Change in Average Annual Wage", "AvgWage", ifelse(PROCHG$indicator=="Percent Change in Output per Job", "GMPJob", "GMPCap"))
INCCHG$IND <- ifelse(INCCHG$Indicator=="Percent Change in Employment-to-Population Ratio", "EmpRatio", ifelse(INCCHG$Indicator=="Percent Change in Median Earnings", "MedEarn", "RelPov"))

names(GRCHG) <- tolower(names(GRCHG))
names(PROCHG) <- tolower(names(PROCHG))
names(INCCHG) <- tolower(names(INCCHG))

with(GRCHG, table(IND, indicator))
with(PROCHG, table(IND, indicator))
with(INCCHG, table(IND, Indicator))

rescale <- function(DF){
  L <- split(DF, DF$ind)
  LL <- lapply(L, function(e){
    offset <- 0-min(e$value) #brings ranges with + OR - min vals to zereo min
    e$vOffset <- e$value + offset
    e$share <- e$vOffset/max(e$vOffset)
    
    if(!("rank" %in% names(e))){
      cat("Calculating ranks...\n")
      if(e[1,"ind"]=="RelPov"){
        rvalues <- e$value
      } else{
        rvalues <- -e$value
      }
      e$rank <- rank(rvalues, ties.method="min")
    }
    
    cat(e[1,"ind"])
    cat(" | obs: ")
    cat(nrow(e))
    cat(" | Offsetting data by: ")
    cat(offset)
    cat("\n")
    
    return(e)
  })
  
  return(do.call("rbind", LL))
}

REGR <- rescale(GRCHG)
REPRO <- rescale(PROCHG)
REINC <- rescale(INCCHG)
keep <- c("year", "cbsa", "indicator", "ind", "value", "rank", "vOffset", "share")
RESCALED <- rbind(REGR[keep], REPRO[keep], REINC[keep])

json <- toJSON(list(measures=ALL, values=VALUES), digits=5)
writeLines(json, "coreIndicators.json")

#testing best way to normalize
test<- c(10,20,3,4,19,22,34,56,-7,-3,-4,-56,-78,-96,-4,-34,5,6,7,8)
testScale <- scale(test)
testScale2 <- testScale + (0-min(testScale))
testScale3 <- testScale2/max(testScale2)

testScale2B <- test + (0-min(test))
testScale3B <- testScale2B/max(testScale2B)

range(testScale3-testScale3B)



