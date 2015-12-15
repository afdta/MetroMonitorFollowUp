#Notes about data:Inflation adjustment? Not necessary for index, but useful for display

#IMPORT
setwd("/home/alec/Projects/metro-index/data/")
nastr <- c("na","N/A","NA","")

GrChg <- read.csv("Growth Change.csv", stringsAsFactors=FALSE, na.strings=nastr)
GrRnk <- read.csv("Growth Ranks.csv", stringsAsFactors=FALSE, na.strings=nastr)
GrVal <- read.csv("Growth Values.csv", stringsAsFactors=FALSE, na.strings=nastr)

IncRaceChg <- read.csv("Inclusion by Race MAD Change.csv", stringsAsFactors=FALSE, na.strings=nastr)
IncRaceRnk <- read.csv("Inclusion by Race MAD Ranks.csv", stringsAsFactors=FALSE, na.strings=nastr)
IncRaceVal <- read.csv("Inclusion by Race MAD Values.csv", stringsAsFactors=FALSE, na.strings=nastr)

IncChg <- read.csv("Inclusion Change.csv", stringsAsFactors=FALSE, na.strings=nastr)
IncRnk <- read.csv("Inclusion Ranks.csv", stringsAsFactors=FALSE, na.strings=nastr)
IncVal <- read.csv("Inclusion Values.csv", stringsAsFactors=FALSE, na.strings=nastr)

ProChg <- read.csv("Prosperity Change.csv", stringsAsFactors=FALSE, na.strings=nastr)
ProRnk <- read.csv("Prosperity Ranks.csv", stringsAsFactors=FALSE, na.strings=nastr)
ProVal <- read.csv("Prosperity Values.csv", stringsAsFactors=FALSE, na.strings=nastr)

ProIdx <- read.csv("Prosperity Index.csv", stringsAsFactors=FALSE, na.strings=nastr)

listIndicators <- function(...){
  args <- list(...)
  for(i in args){
    nm <- names(i)
    if("indicator" %in% nm){
      print(table(i$indicator))
    } else if("Indicator" %in% nm){
      print(table(i$Indicator))
    }else{
      cat("No indicator variable in data frame... \n")
    }
    cat("\n\n")
  }
}
listIndicators(GrChg,GrVal,GrRnk)
listIndicators(IncChg,IncVal,IncRnk)
listIndicators(ProChg,ProVal,ProRnk)

