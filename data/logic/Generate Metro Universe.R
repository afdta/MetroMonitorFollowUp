library("metromonitor")
library("jsonlite")

t100 <- metropops(TRUE, "2013")[c("CBSA_Code", "CBSA_Title", "lon", "lat")]

t100_list <- split(t100, t100$CBSA_Code)

json <- toJSON(t100_list, digits=5)

writeLines(json, "~/Projects/Brookings/DataViz/metro-index/data/logic/T100Universe.json")


df2list <- function(row){
  L <- list()
  L$CBSA_Code <- row[1, "CBSA_Code"]
  L$CBSA_Title <- row[1, "CBSA_Title"]
  L$lon <- row[1, "lon"]
  L$lat <- row[1, "lat"]
  return(L)
}

t100_final <- lapply(t100_list, df2list)
