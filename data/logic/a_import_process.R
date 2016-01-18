#Notes about data:Inflation adjustment? Not necessary for index, but useful for display
#inclusion change missing ranks (though not necessary, right?)
#index values are 0 in 2000
#are percentage points used

library("reshape2")
library("ggplot2")
library("GGally")
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
IncRnk <- read.csv("Inclusion Ranks.csv", stringsAsFactors=FALSE, na.strings=nastr)
IncVal <- read.csv("Inclusion Values.csv", stringsAsFactors=FALSE, na.strings=nastr)

ProChg <- read.csv("Prosperity Change.csv", stringsAsFactors=FALSE, na.strings=nastr)
ProRnk <- read.csv("Prosperity Ranks.csv", stringsAsFactors=FALSE, na.strings=nastr)
ProVal <- read.csv("Prosperity Values.csv", stringsAsFactors=FALSE, na.strings=nastr)

ProIdx <- read.csv("Prosperity Index.csv", stringsAsFactors=FALSE, na.strings=nastr)

#look at variables
listIndicators <- function(...){
  args <- list(...)

  for(i in args){
    cat("==================================================================================\n")
    nm <- names(i)
    if("indicator" %in% nm){
      cat("Indicators:\n")
      print(table(i$indicator))
    } else if("Indicator" %in% nm){
      cat("Indicators:\n")
      print(table(i$Indicator))
    }else{
      cat("No indicator variable in data frame... \n")
    }
    
    if("Year" %in% nm){
      cat("\nYears:\n")
      print(table(i$Year))
    } else if("year" %in% nm){
      cat("\nYears:\n")
      print(table(i$year))
    }
    
    cat("\n\n")
  }
}
listIndicators(GrChg,GrVal,GrRnk)
listIndicators(IncChg,IncVal,IncRnk)
listIndicators(ProChg,ProVal,ProRnk)
listIndicators(ProIdx)

#get metro ID
metID <- metropops(TRUE, "2013")[c("CBSA_Code","CBSA_Title")]
metID$Geo <- factor(metID$CBSA_Code, levels=metID$CBSA_Code, labels=metID$CBSA_Title)
sum(metID$Geo == metID$CBSA_Title)

#fn to combine 3 data frames
merge3 <- function(df1, df2, df3, by, all, suffixes=c(".df1", ".df2", ".df3")){
  m1 <- merge(df1, df2, by=by, all=all, suffixes=suffixes[1:2])
  m2 <- merge(m1, df3, by=by, all=all, suffixes=c("",suffixes[3]))
  return(m2)
}

#DO SOME CLEAN UP / FILTERING FOR EXPORT
GrRnk$Year_ <- GrRnk$year
GrRnk$Composite = "Growth" #Jan2016 data update -- need to do some renaming
ProRnk$Year_ <- ProRnk$Year
IncRnk$Year_ <- IncRnk$Year
IncRnk[IncRnk$Year=="2000-2014","Year"] <- "2004-2014"

#names(GrRnk) <- c("Year", "CBSA", "CBSA.Name", "Rank", "Score", "Year_", "Composite")

#EXPORT
GRR <- GrRnk
GRCHG <- GrChg[GrChg$CBSA %in% metID$CBSA_Code, ]
GRCHG$SE <- as.numeric(NA) #add in to match inclusion structure
GRVAL <- GrVal[GrVal$CBSA %in% metID$CBSA_Code, ]
GRR$Period <- ifelse(GRR$year=="2013-2014", "One", ifelse(GRR$year=="2009-2014", "Five", "Ten"))
GRCHG$Period <- ifelse(GRCHG$year=="2013-2014", "One", ifelse(GRCHG$year=="2009-2014", "Five", "Ten"))
GRCHG$IND <- ifelse(GRCHG$indicator=="Percent Change in Aggregate Wages", "Wages", ifelse(GRCHG$indicator=="Percent Change in Employment", "Emp", "GMP"))
GRVAL$IND <- ifelse(GRVAL$indicator=="Aggregate Wages, indexed to 2000", "Wages", ifelse(GRVAL$indicator=="Employment, indexed to 2000", "Emp", "GMP"))
table(GRR$Period, GRR$Year)
table(GRCHG$Period, GRCHG$year)
table(GRCHG$IND, GRCHG$indicator)
table(GRVAL$IND, GRVAL$indicator)

GRR_WIDE <- merge(dcast(GRR, CBSA~Period, value.var="rank"), dcast(GRR, CBSA~Period, value.var="score"), by="CBSA", suffixes=c("R", "Z"))
GRCHG_WIDE <- merge(dcast(GRCHG, CBSA~IND+Period, value.var="rank"), dcast(GRCHG, CBSA~IND+Period, value.var="value"), by="CBSA", suffixes=c("R","V"))

PROR <- ProRnk
PROCHG <- ProChg[ProChg$CBSA %in% metID$CBSA_Code, ]
PROCHG$SE <- as.numeric(NA) #add in to match inclusion structure
PROVAL <- ProVal[ProVal$CBSA %in% metID$CBSA_Code, ]
PROIDX <- ProIdx[ProIdx$CBSA %in% metID$CBSA_Code, ]
PROR$Period <- ifelse(PROR$Year=="2013-2014", "One", ifelse(PROR$Year=="2009-2014", "Five", "Ten"))
PROCHG$Period <- ifelse(PROCHG$year=="2013-2014", "One", ifelse(PROCHG$year=="2009-2014", "Five", "Ten"))
PROCHG$IND <- ifelse(PROCHG$indicator=="Percent Change in Average Annual Wage", "AvgWage", ifelse(PROCHG$indicator=="Percent Change in Output per Job", "GMPJob", "GMPCap"))
PROVAL$IND <- ifelse(PROVAL$indicator=="Average Annual Wage", "AvgWage", ifelse(PROVAL$indicator=="Output per Job", "GMPJob", "GMPCap"))
PROIDX$IND <- ifelse(PROIDX$indicator=="Average Annual Wage, indexed to 2000", "AvgWage", ifelse(PROIDX$indicator=="Output per Job, indexed to 2000", "GMPJob", "GMPCap"))
table(PROR$Period, PROR$Year)
table(PROCHG$Period, PROCHG$year)
table(PROCHG$IND, PROCHG$indicator)
table(PROVAL$IND, PROVAL$indicator)
table(PROIDX$IND, PROIDX$indicator)

PROR_WIDE <- merge(dcast(PROR, CBSA~Period, value.var="Rank"), dcast(PROR, CBSA~Period, value.var="Score"), by="CBSA", suffixes=c("R", "Z"))
PROCHG_WIDE <- merge(dcast(PROCHG, CBSA~IND+Period, value.var="rank"), dcast(PROCHG, CBSA~IND+Period, value.var="value"), by="CBSA", suffixes=c("R","V"))

INCR <- IncRnk
INCCHG <- IncChg[IncChg$CBSA %in% metID$CBSA_Code & IncChg$Race=="Total", c("Year", "CBSA", "CBSA.Name", "Indicator", "Value", "SE")]
INCCHG$rank <- as.numeric(NA) #placeholder for later
INCVAL <- IncVal[IncVal$CBSA %in% metID$CBSA_Code & IncVal$Race=="Total", ]
INCR$Period <- ifelse(INCR$Year=="2013-2014", "One", ifelse(INCR$Year=="2009-2014", "Five", "Ten"))
INCCHG$Period <- ifelse(INCCHG$Year=="2013-2014", "One", ifelse(INCCHG$Year=="2009-2014", "Five", "Ten"))
INCCHG$IND <- ifelse(INCCHG$Indicator=="Percent Change in Employment-to-Population Ratio", "EmpRatio", ifelse(INCCHG$Indicator=="Percent Change in Median Earnings", "MedEarn", "RelPov"))
INCVAL$IND <- ifelse(INCVAL$Indicator=="Employment-to-Population Ratio", "EmpRatio", ifelse(INCVAL$Indicator=="Median Earnings", "MedEarn", "RelPov"))
table(INCR$Period, INCR$Year)
table(INCCHG$Period, INCCHG$Year)
table(INCCHG$IND, INCCHG$Indicator)
table(INCVAL$IND, INCVAL$Indicator)

INCR_WIDE <- merge(dcast(INCR, CBSA~Period, value.var="Rank"), dcast(INCR, CBSA~Period, value.var="Score"), by="CBSA", suffixes=c("R","Z"))
INCCHG1_WIDE <- merge(dcast(INCCHG, CBSA~IND+Period, value.var="Value"), dcast(INCCHG, CBSA~IND+Period, value.var="SE"), by="CBSA", suffixes=c("V","SE"))

INCCHG_LIST <- split(INCCHG[c("CBSA", "Period", "IND", "Value")], list(INCCHG$Period, INCCHG$IND))
INCCHG2 <- do.call(rbind, lapply(INCCHG_LIST, function(d){
  if(d[1,"IND"]=="RelPov"){
    rvalues <- d$Value
  } else{
    rvalues <- -d$Value
  }
  d$rank <- rank(rvalues, ties.method="min")
  d$Z <- (d$Value-mean(d$Value))/sd(d$Value)
  return(d)
}))
INCCHG2_WIDE <- merge(dcast(INCCHG2, CBSA~IND+Period, value.var="rank"), dcast(INCCHG2, CBSA~IND+Period, value.var="Z"), by="CBSA", suffixes=c("R","Z"))
INCCHG_WIDE <- merge(INCCHG1_WIDE, INCCHG2_WIDE, by="CBSA")

ALL <- list(growth=list(overall=GRR_WIDE, detailed=GRCHG_WIDE),
            prosperity=list(overall=PROR_WIDE, detailed=PROCHG_WIDE),
            inclusion=list(overall=INCR_WIDE, detailed=INCCHG_WIDE))

names(INCVAL) <- tolower(names(INCVAL))
names(GRVAL) <- tolower(names(GRVAL))
names(PROVAL) <- tolower(names(PROVAL))
names(PROIDX) <- tolower(names(PROIDX))
PROVAL$se <- 0
PROIDX$se <- 0
GRVAL$se <- 0
getVals <- function(df){
  years <- unique(df$year)
  cat("Available years in data frame: ")
  cat(paste0(years, collapse=", "))
  cat("\n")
  s <- split(df, df$cbsa)
  ss <- lapply(s, function(e){
    wide <- merge(dcast(e, year+cbsa~ind, value.var="value"), dcast(e, year+cbsa~ind, value.var="se"), by=c("year","cbsa"), suffixes=c("V","SE"))
    wide <- wide[order(wide$year), ]
    return(wide)
  })
  return(ss)
}
  
VALUES <- list(growth=getVals(GRVAL), prosperity=getVals(PROVAL), prosperity2=getVals(PROIDX), inclusion=getVals(INCVAL))


json <- toJSON(list(measures=ALL, values=VALUES), digits=5)
writeLines(json, "coreIndicators.json")

##INCLUSION BY RACE
#high-level
INCRACECH <- IncRaceChg[IncRaceChg$CBSA %in% metID$CBSA_Code, ]
INCRACEVAL <- IncRaceVal[IncRaceVal$CBSA %in% metID$CBSA_Code, ]
INCRACERNK <- IncRaceRnk

INCRACECH$Period <- ifelse(INCRACECH$Year=="2013-2014", "One", ifelse(INCRACECH$Year=="2009-2014", "Five", "Ten"))
INCRACECH$IND <- ifelse(INCRACECH$Indicator=="Employment Ratio, Percent Change in Absolute Difference", "EmpRatio", ifelse(INCRACECH$Indicator=="Median Income, Percent Change in Absolute Difference", "MedEarn", "RelPov"))
INCRACERNK$Period <- ifelse(INCRACERNK$Year=="2013-2014", "One", ifelse(INCRACERNK$Year=="2009-2014", "Five", "Ten"))
with(INCRACECH, table(Year, Period))
with(INCRACECH, table(IND, Indicator))
with(INCRACERNK, table(Year, Period))

INCRACERNK_WIDE <- merge(dcast(INCRACERNK, CBSA~Period, value.var="Rank"), dcast(INCRACERNK, CBSA~Period, value.var="Score"), by="CBSA", suffixes=c("R","Z"))
INCRACECH_WIDE <- merge(dcast(INCRACECH, CBSA~IND+Period, value.var="Value"), dcast(INCRACECH, CBSA~IND+Period, value.var="SE"), by="CBSA", suffixes=c("V","SE"))


#detailed
INCCHGd <- IncChg[IncChg$CBSA %in% metID$CBSA_Code, c("Year", "CBSA", "CBSA.Name", "Indicator", "Race", "Value", "SE")]
INCVALd <- IncVal[IncVal$CBSA %in% metID$CBSA_Code, ]
INCCHGd$race <- ifelse(INCCHGd$Race=="People of Color", "NonWhite", INCCHGd$Race)
INCVALd$race <- ifelse(INCVALd$Race=="People of Color", "NonWhite", INCVALd$Race)
INCCHGd$IND <- ifelse(INCCHGd$Indicator=="Percent Change in Employment-to-Population Ratio", "EmpRatio", ifelse(INCCHGd$Indicator=="Percent Change in Median Earnings", "MedEarn", "RelPov"))
INCVALd$IND <- ifelse(INCVALd$Indicator=="Employment-to-Population Ratio", "EmpRatio", ifelse(INCVALd$Indicator=="Median Earnings", "MedEarn", "RelPov"))
INCCHGd$Period <- ifelse(INCCHGd$Year=="2013-2014", "One", ifelse(INCCHGd$Year=="2009-2014", "Five", "Ten"))
with(INCVALd, table(race, Race))
with(INCVALd, table(IND, Indicator))
with(INCCHGd, table(race, Race))
with(INCCHGd, table(IND, Indicator))
with(INCCHGd, table(Year, Period))

INCVALd_WIDE <- merge(dcast(INCVALd, CBSA+Year~race+IND, value.var="Value"), dcast(INCVALd, CBSA+Year~race+IND, value.var="SE"), by=c("CBSA","Year"), suffixes=c("V","SE"))
INCCHGd_Wide <- merge(dcast(INCCHGd, CBSA~race+IND+Period, value.var="Value"), dcast(INCCHGd, CBSA~race+IND+Period, value.var="SE"), by=c("CBSA"), suffixes=c("V","SE"))

INCVALd_LIST <- split(INCVALd_WIDE, INCVALd_WIDE$CBSA)


INCRACE <- list(ranks=INCRACERNK_WIDE, change=INCRACECH_WIDE, changeDetail=INCCHGd_Wide, levelsDetail=INCVALd_LIST)

json2 <- toJSON(INCRACE, digits=5)
writeLines(json2, "inclusionByRace.json")




